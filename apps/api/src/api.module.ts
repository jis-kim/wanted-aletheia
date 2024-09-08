import { DatabaseModule } from '@app/database';
import { LoggerModule } from '@app/logger';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApiController } from './api.controller';
import { ApiService } from './api.service';
import { ProductOrder } from './entity/product-order.entity';
import { Product } from './entity/product.entity';

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
