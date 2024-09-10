import { OmitType, PickType } from '@nestjs/swagger';
import { OrderStatus, OrderType, ProductOrder } from '../entity/product-order.entity';

// POST /order API Response DTO
export class CreateOrderResponseDto extends OmitType(ProductOrder, ['updatedAt', 'deletedAt', 'product', 'userId']) {}
