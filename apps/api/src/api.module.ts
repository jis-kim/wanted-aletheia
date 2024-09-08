import { DatabaseModule } from '@app/database';
import { Module } from '@nestjs/common';

import { ApiController } from './api.controller';
import { ApiService } from './api.service';
import { LoggerModule } from '@app/logger';
import { Product } from './entity/product.entity';
import { ProductOrder } from './entity/product-order.entity';

import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    DatabaseModule.forRoot('apps/api/.env', [Product, ProductOrder]),
    TypeOrmModule.forFeature([Product, ProductOrder]),
    LoggerModule,
  ],
  controllers: [ApiController],
  providers: [ApiService],
})
export class ApiModule {}
