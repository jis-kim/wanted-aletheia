import { OmitType } from '@nestjs/swagger';

import { OrderDto } from './order.dto';

// POST /order API Response DTO
export class CreateOrderResponseDto extends OmitType(OrderDto, ['updatedAt', 'userId']) {}
