import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Entity, Repository } from 'typeorm';

import { CreateOrderDto } from './dto/create-order.dto';
import { OrderStatus, OrderType, ProductOrder } from './entity/product-order.entity';
import { Product, TransactionPurpose } from './entity/product.entity';
import { OrderService } from './order.service';
import { UpdateOrderDto } from './dto/update-order.dto';

describe('OrderService', () => {
  let service: OrderService;
  let orderRepository: Repository<ProductOrder>;
  let productRepository: Repository<Product>;
  let mockTransactionInsert: jest.Mock;

  beforeEach(async () => {
    mockTransactionInsert = jest.fn().mockImplementation(async (entity, data) => ({
      identifiers: [{ id: 'order-1' }],
      generatedMaps: [{ status: OrderStatus.ORDERED, ...data, createdAt: new Date() }],
      raw: {},
    }));

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService,
        {
          provide: getRepositoryToken(ProductOrder),
          useValue: {
            manager: {
              transaction: jest.fn((callback) =>
                callback({
                  insert: mockTransactionInsert,
                  update: jest.fn().mockResolvedValue({}),
                }),
              ),
            },
            findOneBy: jest.fn(),
            update: jest.fn(),
            softRemove: jest.fn(),
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Product),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<OrderService>(OrderService);
    orderRepository = module.get<Repository<ProductOrder>>(getRepositoryToken(ProductOrder));
    productRepository = module.get<Repository<Product>>(getRepositoryToken(Product));
  });

  describe('createOrder', () => {
    it('상품 주문이 성공하면 주문 번호와 상태를 반환한다', async () => {
      const createOrderDto: CreateOrderDto = { productId: '1', quantity: 10 } as CreateOrderDto;
      const product = { id: '1', price: 1000, transactionPurpose: TransactionPurpose.FOR_SALE } as Product;

      jest.spyOn(productRepository, 'findOne').mockResolvedValue(product);
      const result = await service.createOrder('user-1', createOrderDto);

      expect(result).toEqual({
        id: 'order-1',
        orderNumber: expect.any(String),
        type: OrderType.BUY,
        status: OrderStatus.ORDERED,
        totalPrice: 10000,
        productId: '1',
        quantity: 10,
        createdAt: expect.any(Date),
      });
    });

    it('상품의 거래 목적이 FOR_SALE일 경우 BUY로 주문한다', async () => {
      const createOrderDto: CreateOrderDto = { productId: '1', quantity: 10 } as CreateOrderDto;
      const product = { id: '1', price: 1000, transactionPurpose: TransactionPurpose.FOR_SALE } as Product;

      jest.spyOn(productRepository, 'findOne').mockResolvedValue(product);
      const result = await service.createOrder('user-1', createOrderDto);
      expect(result).toEqual({
        id: 'order-1',
        orderNumber: expect.any(String),
        type: OrderType.BUY,
        status: OrderStatus.ORDERED,
        totalPrice: 10000,
        productId: '1',
        quantity: 10,
        createdAt: expect.any(Date),
      });

      expect(mockTransactionInsert).toHaveBeenCalledWith(
        expect.any(Function),
        expect.objectContaining({
          // 전체 dto + 추가 필드
          type: OrderType.BUY,
          userId: 'user-1',
          productId: '1',
          totalPrice: 10000,
          orderNumber: expect.any(String),
        }),
      );
    });

    it('상품의 거래 목적이 FOR_PURCHASE일 경우 SELL로 주문한다', async () => {
      const createOrderDto: CreateOrderDto = { productId: '1', quantity: 10 } as CreateOrderDto;
      const product = { id: '1', price: 1000, transactionPurpose: TransactionPurpose.FOR_PURCHASE } as Product;

      jest.spyOn(productRepository, 'findOne').mockResolvedValue(product);

      const result = await service.createOrder('user-1', createOrderDto);

      expect(result).toEqual({
        id: 'order-1',
        orderNumber: expect.any(String),
        type: OrderType.SELL,
        status: OrderStatus.ORDERED,
        totalPrice: 10000,
        productId: '1',
        quantity: 10,
        createdAt: expect.any(Date),
      });

      expect(mockTransactionInsert).toHaveBeenCalledWith(
        expect.any(Function),
        expect.objectContaining({
          // 전체 dto + 추가 필드
          type: OrderType.SELL,
          userId: 'user-1',
          productId: '1',
          totalPrice: 10000,
          orderNumber: expect.any(String),
        }),
      );
    });

    it('상품을 찾을 수 없을 경우 Not Found', async () => {
      const createOrderDto: CreateOrderDto = { productId: '1', quantity: 10 } as CreateOrderDto;

      jest.spyOn(productRepository, 'findOne').mockResolvedValue(null);

      await expect(service.createOrder('user-1', createOrderDto)).rejects.toThrow(NotFoundException);
    });

    it('주문 수량이 재고보다 많을 경우 Bad Request', async () => {
      const createOrderDto: CreateOrderDto = { productId: '1', quantity: 10 } as CreateOrderDto;
      const product = { id: '1', stockAmount: 5 } as Product;

      jest.spyOn(productRepository, 'findOne').mockResolvedValue(product);

      await expect(service.createOrder('user-1', createOrderDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('getOrderDetail', () => {
    it('올바른 주문자가 주문 번호로 조회하면 주문 상세정보 반환', async () => {
      const order = {
        id: 'order-1',
        orderNumber: 'B-1234567890-123456',
        type: OrderType.BUY,
        status: OrderStatus.ORDERED,
        product: { id: '1', name: 'product', purity: 99.9, price: 1000 },
        quantity: 10,
        totalPrice: 10000,
      } as unknown as ProductOrder;

      jest.spyOn(orderRepository, 'findOne').mockResolvedValue(order);

      const result = await service.getOrderDetail('user-1', 'order-1');

      expect(result).toEqual({
        id: 'order-1',
        orderNumber: 'B-1234567890-123456',
        type: OrderType.BUY,
        status: OrderStatus.ORDERED,
        product: { id: '1', name: 'product', purity: 99.9, price: 1000 },
        quantity: 10,
        totalPrice: 10000,
      });
    });

    it('주문자가 아니거나 order가 없는 경우 Not Found', async () => {
      jest.spyOn(orderRepository, 'findOne').mockResolvedValue(null);

      await expect(service.getOrderDetail('user-1', 'order-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateOrder', () => {
    it('주문자가 주문 상태를 변경하면 update 결과 반환', async () => {
      const updateOrderDto = { shippingAddress: 'address' } as UpdateOrderDto;
      const order = { id: 'order-1', userId: 'user-1', status: OrderStatus.ORDERED } as any as ProductOrder;

      jest.spyOn(orderRepository, 'findOneBy').mockResolvedValue(order);
      jest.spyOn(orderRepository, 'update').mockResolvedValue({} as any);

      const result = await service.updateOrder('user-1', 'order-1', updateOrderDto);
      expect(result).toEqual({
        ...order,
        ...updateOrderDto,
      });
    });

    it('주문자가 아니거나 order가 없는 경우 Not Found', async () => {
      const updateOrderDto = { shippingAddress: 'address' };

      jest.spyOn(orderRepository, 'findOneBy').mockResolvedValue(null);

      await expect(service.updateOrder('user-1', 'order-1', updateOrderDto)).rejects.toThrow(NotFoundException);
    });

    it('배송 완료 상태일 경우 Bad Request', async () => {
      const updateOrderDto = { shippingAddress: 'address' };
      const order = { id: 'order-1', userId: 'user-1', status: OrderStatus.SHIPPED } as any as ProductOrder;

      jest.spyOn(orderRepository, 'findOneBy').mockResolvedValue(order);

      await expect(service.updateOrder('user-1', 'order-1', updateOrderDto)).rejects.toThrow(BadRequestException);
    });

    it('수령 완료 상태일 경우 Bad Request', async () => {
      const updateOrderDto = { shippingAddress: 'address' };
      const order = { id: 'order-1', userId: 'user-1', status: OrderStatus.RECEIVED } as any as ProductOrder;

      jest.spyOn(orderRepository, 'findOneBy').mockResolvedValue(order);

      await expect(service.updateOrder('user-1', 'order-1', updateOrderDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('deleteOrder', () => {
    it('주문자가 주문을 취소하면 soft delete 한다', async () => {
      const order = { id: 'order-1', userId: 'user-1', status: OrderStatus.ORDERED } as any as ProductOrder;

      jest.spyOn(orderRepository, 'findOneBy').mockResolvedValue(order);
      jest.spyOn(orderRepository, 'softRemove').mockResolvedValue({} as any);

      await service.deleteOrder('user-1', 'order-1');
      expect(orderRepository.softRemove).toHaveBeenCalledWith(order);
    });

    it('주문자가 아니거나 order가 없는 경우 Not Found', async () => {
      jest.spyOn(orderRepository, 'findOneBy').mockResolvedValue(null);

      await expect(service.deleteOrder('user-1', 'order-1')).rejects.toThrow(NotFoundException);
    });

    it('주문 완료 상태가 아닐 경우 Bad Request', async () => {
      const order = { id: 'order-1', userId: 'user-1', status: OrderStatus.SHIPPED } as any as ProductOrder;

      jest.spyOn(orderRepository, 'findOneBy').mockResolvedValue(order);

      await expect(service.deleteOrder('user-1', 'order-1')).rejects.toThrow(BadRequestException);
    });
  });

  describe('generateOrderNumber', () => {
    it('주문 번호를 type(B/S)-timestamp(10)-number(6) 형식으로 생성한다', () => {
      // private 메서드이므로 service['']로 호출
      const orderNumber = service['generateOrderNumber']('BUY');
      expect(orderNumber).toMatch(/^B-\d{10}-\d{6}$/);
    });
  });

  describe('calculateTotalPrice', () => {
    it('총 가격을 올바르게 계산한다', () => {
      const totalPrice = service['calculateTotalPrice'](945.55, 10);
      expect(totalPrice).toBe(9455.5);
    });
  });
});
