import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateOrderDto, CreateOrderResponseDto, OrderDetailResponseDto, PaginationLinks } from './dto';
import { SearchOrderDto } from './dto/order-search.dto';
import { UpdateOrderResponseDto } from './dto/update-order-response.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { UpdateStatusResponseDto } from './dto/update-status-response.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { ProductOrder as Order, OrderStatus, OrderType } from './entity/product-order.entity';
import { Product, TransactionPurpose } from './entity/product.entity';
import { SearchOrderResponseDto } from './dto/search-order-response.dto';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,

    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async searchOrder(userId: string, query: SearchOrderDto): Promise<SearchOrderResponseDto> {
    const { date, invoiceType, limit = 10, offset = 0 } = query;
    const queryBuilder = this.orderRepository.createQueryBuilder('order');
    queryBuilder
      .select(['id', 'order_number', 'type', 'status', 'product_id', 'quantity', 'total_price', 'created_at'])
      .where('order.userId = :userId', { userId });

    if (date !== undefined) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      queryBuilder.andWhere('order.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    }

    if (invoiceType !== undefined) {
      queryBuilder.andWhere('order.type = :invoiceType', { invoiceType });
    }

    queryBuilder.orderBy('order.createdAt', 'DESC').skip(offset).take(limit);

    const [orders, total] = await queryBuilder.getManyAndCount();

    const currentPage = Math.floor(offset / limit) + 1;
    const totalPages = Math.ceil(total / limit);

    return {
      orders,
      pagination: {
        total,
        limit,
        offset,
        currentPage,
        totalPages,
        links: this.generatePaginationLinks(limit, offset, total),
      },
    };
  }

  async createOrder(userId: string, createOrderDto: CreateOrderDto): Promise<CreateOrderResponseDto> {
    const product = await this.productRepository.findOne({
      select: ['id', 'stockAmount', 'price', 'transactionPurpose'],
      where: { id: createOrderDto.productId },
    });
    if (product === null) {
      throw new NotFoundException('Product not found');
    }
    if (product.stockAmount < createOrderDto.quantity) {
      throw new BadRequestException('Not enough quantity');
    }

    /**
     * 주문 타입은 상품의 거래 목적에 따라 BUY, SELL로 결정된다.
     * FOR_SALE  -> BUY, FOR_PURCHASE -> SELL
     */
    const type = product.transactionPurpose === TransactionPurpose.FOR_SALE ? OrderType.BUY : OrderType.SELL;

    const orderNumber = this.generateOrderNumber(product.transactionPurpose);
    const totalPrice = this.calculateTotalPrice(product.price, createOrderDto.quantity);

    return this.orderRepository.manager.transaction(async (transactionalEntityManager) => {
      const result = await transactionalEntityManager.insert(Order, {
        ...createOrderDto,
        type,
        userId,
        productId: product.id,
        totalPrice,
        orderNumber,
      });

      const stockAmount: number = product.stockAmount - createOrderDto.quantity;
      await transactionalEntityManager.update(Product, product.id, { stockAmount });
      return {
        ...createOrderDto, // productId, quantity, shippingAddress, shippingName, shippingPhone, shippingMemo
        id: result.identifiers[0].id,
        orderNumber,
        type,
        status: result.generatedMaps[0].status,
        totalPrice,
        createdAt: result.generatedMaps[0].createdAt,
      };
    });
  }

  async getOrderDetail(userId: string, orderId: string): Promise<OrderDetailResponseDto> {
    // TODO: user id index 추가 고려
    const order = await this.orderRepository.findOne({
      where: { id: orderId, userId: userId },
      relations: ['product'],
    });
    if (order === null) {
      throw new NotFoundException('Order not found');
    }

    return {
      id: order.id,
      orderNumber: order.orderNumber,
      type: order.type,
      status: order.status,
      productId: order.productId,
      product: {
        id: order.product.id,
        name: order.product.name,
        purity: order.product.purity,
        price: order.product.price,
        transactionPurpose: order.product.transactionPurpose,
      },
      quantity: order.quantity,
      totalPrice: order.totalPrice,
      createdAt: order.createdAt,
      shippingAddress: order.shippingAddress,
      shippingName: order.shippingName,
      shippingPhone: order.shippingPhone,
      shippingMemo: order.shippingMemo,
    };
  }

  /**
   * 주문의 배송지 정보를 수정한다.
   *
   * @param userId
   * @param orderId
   * @param updateOrderDto
   * @returns
   */
  async updateOrder(userId: string, orderId: string, updateOrderDto: UpdateOrderDto): Promise<UpdateOrderResponseDto> {
    const order = await this.orderRepository.findOneBy({ id: orderId, userId: userId });
    if (order === null) {
      throw new NotFoundException('Order not found');
    }
    if (order.status === OrderStatus.SHIPPED || order.status === OrderStatus.RECEIVED) {
      throw new BadRequestException('Cannot update shipping information');
    }

    await this.orderRepository.update(orderId, {
      shippingAddress: updateOrderDto.shippingAddress,
      shippingName: updateOrderDto.shippingName,
      shippingPhone: updateOrderDto.shippingPhone,
      shippingMemo: updateOrderDto.shippingMemo,
    });

    return {
      ...order,
      ...updateOrderDto,
    };
  }

  async deleteOrder(userId: string, orderId: string): Promise<void> {
    const order = await this.orderRepository.findOneBy({ id: orderId, userId: userId });
    if (order === null) {
      throw new NotFoundException('Order not found');
    }
    if (order.status !== OrderStatus.ORDERED) {
      // 주문 완료 상태에서만 삭제 가능. 입금, 송금 후에는 삭제 불가
      throw new BadRequestException('Cannot delete order in progress');
    }
    await this.orderRepository.softRemove(order);
  }

  async updateOrderStatus(
    userId: string,
    orderId: string,
    updateStatusDto: UpdateStatusDto,
  ): Promise<UpdateStatusResponseDto> {
    const { status } = updateStatusDto;
    const order = await this.orderRepository.findOneBy({ id: orderId, userId: userId });
    if (order === null) {
      throw new NotFoundException('Order not found');
    }

    if (!this.isValidStatusTransition(order.type, order.status, status)) {
      throw new BadRequestException('Invalid status transition');
    }

    await this.orderRepository.update(orderId, { status });
    return {
      id: order.id,
      orderNumber: order.orderNumber,
      type: order.type,
      status,
    };
  }

  // SECTION: private
  private generateOrderNumber(type: string): string {
    const orderType = type === 'BUY' ? 'B' : 'S';
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const randomNumber = Math.floor(Math.random() * 1000000);
    return `${orderType}-${timestamp}-${randomNumber}`;
  }

  private calculateTotalPrice(price: number, quantity: number): number {
    const intPrice = price * 100;
    const intQuantity = quantity * 100;

    return (intPrice * intQuantity) / 10000;
  }

  private isValidStatusTransition(type: OrderType, oldStatus: OrderStatus, newStatus: OrderStatus): boolean {
    /**
     * 주문 흐름 정의
     *  - 구매(BUY) : 주문 -> 입금 -> 배송
     *  - 판매(SELL) : 주문 -> 송금 -> 수령
     */
    const flow =
      type === OrderType.BUY
        ? [OrderStatus.ORDERED, OrderStatus.DEPOSITED, OrderStatus.SHIPPED]
        : [OrderStatus.ORDERED, OrderStatus.TRANSFERRED, OrderStatus.RECEIVED];

    const currentIndex = flow.indexOf(oldStatus);
    const newIndex = flow.indexOf(newStatus);

    // 현재 상태나 새로운 상태가 해당 주문 유형의 흐름에 없는 경우
    if (currentIndex === -1 || newIndex === -1) {
      return false;
    }

    // 새로운 상태가 현재 상태의 다음 단계인 경우에만 유효
    return newIndex === currentIndex + 1;
  }

  private generatePaginationLinks(limit: number, offset: number, total: number): PaginationLinks {
    const currentPage = Math.floor(offset / limit) + 1;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const path = '/api/orders';

    return {
      first: `${path}?limit=${limit}&offset=0`,
      last: `${path}?limit=${limit}&offset=${Math.max(0, (totalPages - 1) * limit)}`,
      prev: currentPage > 1 ? `${path}?limit=${limit}&offset=${Math.max(0, (currentPage - 2) * limit)}` : null,
      next:
        currentPage < totalPages
          ? `${path}?limit=${limit}&offset=${Math.min(currentPage * limit, (totalPages - 1) * limit)}`
          : null,
    };
  }
}
