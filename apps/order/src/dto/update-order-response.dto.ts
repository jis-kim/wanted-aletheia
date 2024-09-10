import { OmitType } from '@nestjs/swagger';
import { ProductOrder } from '../entity/product-order.entity';

export class UpdateOrderResponseDto extends OmitType(ProductOrder, ['deletedAt', 'product']) {}
