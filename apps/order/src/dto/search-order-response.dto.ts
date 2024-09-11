import { PaginationInfo } from './api-response.dto';
import { OrderDto } from './order.dto';

export class SearchOrderResponseDto {
  orders: Omit<OrderDto, 'shippingAddress' | 'shippingMemo' | 'shippingName' | 'shippingPhone'>[];
  pagination: PaginationInfo;
}
