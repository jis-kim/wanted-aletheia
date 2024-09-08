import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateOrderResponseDto } from './dto/create-order-response.dto';
import { CreateOrderDto } from './dto/create-order.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductOrder } from './entity/product-order.entity';
import { Repository } from 'typeorm';
import { Product } from './entity/product.entity';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(ProductOrder)
    private readonly productOrderRepository: Repository<ProductOrder>,

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

    const result = await this.productOrderRepository.insert({
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
