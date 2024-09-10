import { OrderStatus, OrderType } from '../entity/product-order.entity';

export class UpdateStatusResponseDto {
  id: string;
  orderNumber: string;
  type: OrderType;
  status: OrderStatus;
}
