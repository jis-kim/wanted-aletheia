import { OrderStatus } from '../entity/product-order.entity';

// POST /order API Response DTO
export class CreateOrderResponseDto {
  id: string;

  orderNumber: string;

  status: OrderStatus;

  totalPrice: number;
}
