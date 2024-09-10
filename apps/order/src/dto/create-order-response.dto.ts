import { OrderStatus, OrderType } from '../entity/product-order.entity';

// POST /order API Response DTO
export class CreateOrderResponseDto {
  id: string;

  orderNumber: string;

  status: OrderStatus;

  type: OrderType;

  totalPrice: number;
}
