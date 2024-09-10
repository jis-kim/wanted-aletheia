import { OmitType } from '@nestjs/swagger';

import { ProductOrder } from '../entity/product-order.entity';

// POST /order API Response DTO
export class CreateOrderResponseDto extends OmitType(ProductOrder, ['updatedAt', 'deletedAt', 'product', 'userId']) {}
