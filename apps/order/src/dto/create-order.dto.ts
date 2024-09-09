import { Type } from 'class-transformer';
import { IsEnum, IsUUID, IsNumber, IsString, Min, MaxLength, IsOptional } from 'class-validator';

import { OrderType } from '../entity/product-order.entity';
import { IsDecimalWithOneOrTwoDP } from '../common/decorator/is-decimal-with-one-or-two-dp';

// POST /order API Request DTO
export class CreateOrderDto {
  @IsEnum(OrderType)
  type: OrderType;

  /**
   * 주문한 상품 ID
   * @example 6e6dc34f-8715-492f-b03b-03e25faadcb4
   */
  @IsUUID()
  productId: string;

  @IsNumber()
  @Type(() => Number)
  //@IsDecimal({ decimal_digits: '0,2' }) // 소수점 1자리 또는 2자리 허용
  @IsDecimalWithOneOrTwoDP()
  @Min(0.01)
  quantity: number;

  @IsString()
  @MaxLength(255)
  shippingAddress: string;

  @IsString()
  @MaxLength(255)
  shippingName: string;

  @IsString()
  @MaxLength(255)
  shippingPhone: string;

  @IsString()
  @MaxLength(255)
  @IsOptional()
  shippingMemo?: string;
}
