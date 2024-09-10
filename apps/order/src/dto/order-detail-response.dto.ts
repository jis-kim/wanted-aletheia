import { OmitType } from '@nestjs/swagger';
import { ProductOrder } from '../entity/product-order.entity';
import { Product } from '../entity/product.entity';

type ProductInOrderType = Pick<Product, 'id' | 'name' | 'purity' | 'price' | 'transactionPurpose'>;
export class OrderDetailResponseDto extends OmitType(ProductOrder, ['updatedAt', 'deletedAt', 'product', 'userId']) {
  product: ProductInOrderType;
}
