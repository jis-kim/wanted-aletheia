import { PartialType, PickType } from '@nestjs/swagger';
import { CreateOrderDto } from './create-order.dto';

// literal tuple type - readonly array of string literals
const updateFields = ['shippingAddress', 'shippingName', 'shippingPhone', 'shippingMemo'] as const;

export class UpdateOrderDto extends PartialType(PickType(CreateOrderDto, updateFields)) {}
