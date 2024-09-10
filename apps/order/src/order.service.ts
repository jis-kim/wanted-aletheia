import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateOrderDto, CreateOrderResponseDto, OrderDetailResponseDto } from './dto';
import { ProductOrder as Order, OrderStatus } from './entity/product-order.entity';
import { Product } from './entity/product.entity';
import { UpdateOrderDto } from './dto/update-order.dto';
import { UpdateOrderResponseDto } from './dto/update-order-response.dto';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,

    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async createOrder(userId: string, createOrderDto: CreateOrderDto): Promise<CreateOrderResponseDto> {
    const product = await this.getProductById(createOrderDto.productId);
    if (product === null) {
      throw new NotFoundException('Product not found');
    }

    const orderNumber = this.generateOrderNumber(createOrderDto.type);
    const totalPrice = this.calculateTotalPrice(product.price, createOrderDto.quantity);

    const result = await this.orderRepository.insert({
      ...createOrderDto,
      userId,
      productId: product.id,
      totalPrice,
      orderNumber,
    });

    return {
      id: result.identifiers[0].id,
      orderNumber,
      status: result.generatedMaps[0].status,
      totalPrice,
    };
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
      product: {
        id: order.product.id,
        name: order.product.name,
        purity: order.product.purity,
        price: order.product.price,
      },
      quantity: order.quantity,
      totalPrice: order.totalPrice,
      orderDate: order.orderDate,
      updatedAt: order.updatedAt,
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
      order: {
        ...order,
        ...updateOrderDto,
      },
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

  private async getProductById(productId: string): Promise<Product | null> {
    return this.productRepository.findOneBy({ id: productId });
  }
}
