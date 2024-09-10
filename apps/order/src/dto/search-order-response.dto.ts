import { OrderDto } from './order.dto';
import { PaginationInfo } from './api-response.dto';

export class SearchOrderResponseDto {
  orders: Omit<OrderDto, 'shippingAddress' | 'shippingMemo' | 'shippingName' | 'shippingPhone'>[];
  pagination: PaginationInfo;
}
