import { DatabaseModule } from '@app/database';
import { LoggerModule } from '@app/logger';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ProductOrder } from './entity/product-order.entity';
import { Product } from './entity/product.entity';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GrpcAuthService } from './grpc-auth.service';
import { GrpcAuthGuard } from './common/guard/grpc-auth.guard';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    DatabaseModule.forRoot('apps/order/.env', [Product, ProductOrder]),
    TypeOrmModule.forFeature([Product, ProductOrder]),
    ClientsModule.registerAsync([
      {
        name: 'AUTH_PACKAGE',
        imports: [ConfigModule],
        useFactory: async (configService: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            package: 'auth',
            protoPath: 'proto/auth.proto',
            url: `${configService.get<string>('GRPC_REQUEST_HOST', 'localhost')}:${configService.get<number>('GRPC_REQUEST_PORT', 50051)}`,
          },
        }),
        inject: [ConfigService],
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
