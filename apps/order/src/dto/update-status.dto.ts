import { IsEnum } from 'class-validator';
import { OrderStatus } from '../entity/product-order.entity';

/**
 * status 변경
 */
export class UpdateStatusDto {
  @IsEnum(OrderStatus)
  status: OrderStatus;
}
