import { OmitType } from '@nestjs/swagger';

import { OrderDto } from './order.dto';

export class SearchOrderResponseDto extends OmitType(OrderDto, [
  'shippingAddress',
  'shippingMemo',
  'shippingName',
  'shippingPhone',
  'status',
  'totalPrice',
  'type',
]) {}
