import { OmitType } from '@nestjs/swagger';

import { Product } from '../entity/product.entity';

import { OrderDto } from './order.dto';

type ProductInOrderType = Pick<Product, 'id' | 'name' | 'purity' | 'price' | 'transactionPurpose'>;
export class OrderDetailResponseDto extends OmitType(OrderDto, ['updatedAt', 'userId']) {
  product: ProductInOrderType;
}
