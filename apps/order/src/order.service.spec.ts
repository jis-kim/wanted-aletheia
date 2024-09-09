import { Test, TestingModule } from '@nestjs/testing';
import { OrderService } from './order.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { OrderType, ProductOrder } from './entity/product-order.entity';
import { Product } from './entity/product.entity';
import { NotFoundException } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';

describe('OrderService', () => {
  let service: OrderService;
  let productOrderRepository: Repository<ProductOrder>;
  let productRepository: Repository<Product>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService,
        {
          provide: getRepositoryToken(ProductOrder),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(Product),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<OrderService>(OrderService);
    productOrderRepository = module.get<Repository<ProductOrder>>(getRepositoryToken(ProductOrder));
    productRepository = module.get<Repository<Product>>(getRepositoryToken(Product));
  });

  describe('createOrder', () => {
    it('상품 주문이 성공하면 주문 번호와 상태를 반환한다', async () => {
      const createOrderDto: CreateOrderDto = { productId: '1', type: OrderType.BUY, quantity: 10 } as CreateOrderDto;
      const product = { id: '1', price: 1000 } as Product;

      jest.spyOn(productRepository, 'findOneBy').mockResolvedValue(product);
      jest.spyOn(productOrderRepository, 'insert').mockResolvedValue({
        identifiers: [{ id: 'order-1' }],
        generatedMaps: [{ status: 'pending' }],
        raw: {},
      });

      const result = await service.createOrder('user-1', createOrderDto);

      expect(result).toEqual({
        id: 'order-1',
        orderNumber: expect.any(String),
        status: 'pending',
        totalPrice: 10000,
      });
    });

    it('상품을 찾을 수 없을 경우 Not Found 예외를 던진다', async () => {
      const createOrderDto: CreateOrderDto = { productId: '1', type: OrderType.BUY, quantity: 10 } as CreateOrderDto;

      jest.spyOn(productRepository, 'findOneBy').mockResolvedValue(null);

      await expect(service.createOrder('user-1', createOrderDto)).rejects.toThrow(NotFoundException);
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
