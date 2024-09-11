import { DatabaseModule } from '@app/database';
import { LoggerModule } from '@app/logger';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ProductOrder } from './entity/product-order.entity';
import { Product } from './entity/product.entity';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule } from '@nestjs/config';
import { GrpcAuthService } from './grpc-auth.service';
import { GrpcAuthGuard } from './common/guard/grpc-auth.guard';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    DatabaseModule.forRoot('apps/order/.env', [Product, ProductOrder]),
    TypeOrmModule.forFeature([Product, ProductOrder]),
    ClientsModule.register([
      {
        name: 'AUTH_PACKAGE',
        transport: Transport.GRPC,
        options: {
          package: 'auth',
          protoPath: 'proto/auth.proto',
          url: `localhost:50051`,
        },
      },
    ]),
    ConfigModule,
    LoggerModule,
  ],
  controllers: [OrderController],
  providers: [
    OrderService,
    GrpcAuthService,
    {
      provide: APP_GUARD,
      useClass: GrpcAuthGuard,
    },
  ],
})
export class OrderModule {}
