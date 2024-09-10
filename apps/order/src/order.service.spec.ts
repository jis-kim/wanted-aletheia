import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateOrderDto } from './dto/create-order.dto';
import { OrderStatus, OrderType, ProductOrder } from './entity/product-order.entity';
import { Product, TransactionPurpose } from './entity/product.entity';
import { OrderService } from './order.service';
import { UpdateOrderDto } from './dto/update-order.dto';
import { SearchOrderDto } from './dto/order-search.dto';

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
            createQueryBuilder: jest.fn(),
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

  describe('searchOrder', () => {
    it('사용자 ID와 검색 조건으로 주문을 검색하면 페이지네이션된 결과를 반환한다', async () => {
      const userId = 'user-1';
      const query = { limit: 10, offset: 0 };
      const mockOrders = [{ id: 'order-1' }, { id: 'order-2' }];
      const mockCount = 2;

      const queryBuilder = {
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([mockOrders, mockCount]),
      };

      jest.spyOn(orderRepository, 'createQueryBuilder').mockReturnValue(queryBuilder as any);

      const result = await service.searchOrder(userId, query);

      expect(result).toEqual({
        orders: mockOrders,
        pagination: {
          total: mockCount,
          limit: 10,
          offset: 0,
          currentPage: 1,
          totalPages: 1,
          links: expect.any(Object),
        },
      });
    });

    it('날짜 필터가 제공되면 해당 날짜의 주문만 반환한다', async () => {
      const userId = 'user-1';
      const query = { date: '2024-09-11', limit: 10, offset: 0 };
      const mockOrders = [{ id: 'order-1', createdAt: new Date('2024-09-11') }];
      const mockCount = 1;

      const queryBuilder = {
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([mockOrders, mockCount]),
      };

      jest.spyOn(orderRepository, 'createQueryBuilder').mockReturnValue(queryBuilder as any);

      const result = await service.searchOrder(userId, query as any as SearchOrderDto);

      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        'order.createdAt BETWEEN :startDate AND :endDate',
        expect.any(Object),
      );
      expect(result.orders).toEqual(mockOrders);
      expect(result.pagination.total).toBe(mockCount);
    });

    it('송장 유형 필터가 제공되면 해당 유형의 주문만 반환한다', async () => {
      const userId = 'user-1';
      const query = { invoiceType: OrderType.BUY, limit: 10, offset: 0 };
      const mockOrders = [{ id: 'order-1', type: OrderType.BUY }];
      const mockCount = 1;

      const queryBuilder = {
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([mockOrders, mockCount]),
      };

      jest.spyOn(orderRepository, 'createQueryBuilder').mockReturnValue(queryBuilder as any);

      const result = await service.searchOrder(userId, query);

      expect(queryBuilder.andWhere).toHaveBeenCalledWith('order.type = :invoiceType', { invoiceType: OrderType.BUY });
      expect(result.orders).toEqual(mockOrders);
      expect(result.pagination.total).toBe(mockCount);
    });
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

  describe('updateOrderStatus', () => {
    it('유효한 상태 변경 요청이면 주문 상태를 업데이트하고 결과를 반환한다', async () => {
      const userId = 'user-1';
      const orderId = 'order-1';
      const updateStatusDto = { status: OrderStatus.DEPOSITED };
      const order = {
        id: orderId,
        userId,
        type: OrderType.BUY,
        status: OrderStatus.ORDERED,
        orderNumber: 'B-1234567890-123456',
      } as ProductOrder;

      jest.spyOn(orderRepository, 'findOneBy').mockResolvedValue(order);
      jest.spyOn(orderRepository, 'update').mockResolvedValue({} as any);

      const result = await service.updateOrderStatus(userId, orderId, updateStatusDto);

      expect(result).toEqual({
        id: orderId,
        orderNumber: 'B-1234567890-123456',
        type: OrderType.BUY,
        status: OrderStatus.DEPOSITED,
      });
    });

    it('유효하지 않은 상태 변경 요청이면 BadRequestException을 발생시킨다', async () => {
      const userId = 'user-1';
      const orderId = 'order-1';
      const updateStatusDto = { status: OrderStatus.SHIPPED };
      const order = {
        id: orderId,
        userId,
        type: OrderType.BUY,
        status: OrderStatus.ORDERED,
      } as ProductOrder;

      jest.spyOn(orderRepository, 'findOneBy').mockResolvedValue(order);

      await expect(service.updateOrderStatus(userId, orderId, updateStatusDto)).rejects.toThrow(BadRequestException);
    });

    it('주문을 찾을 수 없으면 NotFoundException을 발생시킨다', async () => {
      const userId = 'user-1';
      const orderId = 'non-existent-order';
      const updateStatusDto = { status: OrderStatus.DEPOSITED };

      jest.spyOn(orderRepository, 'findOneBy').mockResolvedValue(null);

      await expect(service.updateOrderStatus(userId, orderId, updateStatusDto)).rejects.toThrow(NotFoundException);
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

  describe('generatePaginationLinks', () => {
    it('첫 페이지에 대한 링크를 올바르게 생성한다', () => {
      const links = service['generatePaginationLinks'](10, 0, 100);
      expect(links).toEqual({
        first: '/api/orders?limit=10&offset=0',
        last: '/api/orders?limit=10&offset=90',
        prev: null,
        next: '/api/orders?limit=10&offset=10',
      });
    });

    it('마지막 페이지에 대한 링크를 올바르게 생성한다', () => {
      const links = service['generatePaginationLinks'](10, 90, 100);
      expect(links).toEqual({
        first: '/api/orders?limit=10&offset=0',
        last: '/api/orders?limit=10&offset=90',
        prev: '/api/orders?limit=10&offset=80',
        next: null,
      });
    });

    it('중간 페이지에 대한 링크를 올바르게 생성한다', () => {
      const links = service['generatePaginationLinks'](10, 50, 100);
      expect(links).toEqual({
        first: '/api/orders?limit=10&offset=0',
        last: '/api/orders?limit=10&offset=90',
        prev: '/api/orders?limit=10&offset=40',
        next: '/api/orders?limit=10&offset=60',
      });
    });

    it('총 항목 수가 0일 때 올바른 링크를 생성한다', () => {
      const links = service['generatePaginationLinks'](10, 0, 0);
      expect(links).toEqual({
        first: '/api/orders?limit=10&offset=0',
        last: '/api/orders?limit=10&offset=0',
        prev: null,
        next: null,
      });
    });

    it('총 항목 수가 limit보다 작을 때 올바른 링크를 생성한다', () => {
      const links = service['generatePaginationLinks'](10, 0, 5);
      expect(links).toEqual({
        first: '/api/orders?limit=10&offset=0',
        last: '/api/orders?limit=10&offset=0',
        prev: null,
        next: null,
      });
    });

    it('총 페이지 수가 1일 때 올바른 링크를 생성한다', () => {
      const links = service['generatePaginationLinks'](10, 0, 10);
      expect(links).toEqual({
        first: '/api/orders?limit=10&offset=0',
        last: '/api/orders?limit=10&offset=0',
        prev: null,
        next: null,
      });
    });
  });
});
