import { DatabaseModule } from '@app/database';
import { LoggerModule } from '@app/logger';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ProductOrder } from './entity/product-order.entity';
import { Product } from './entity/product.entity';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';

@Module({
  imports: [
    DatabaseModule.forRoot('apps/order/.env', [Product, ProductOrder]),
    TypeOrmModule.forFeature([Product, ProductOrder]),
    LoggerModule,
  ],
  controllers: [OrderController],
  providers: [OrderService],
})
export class OrderModule {}
