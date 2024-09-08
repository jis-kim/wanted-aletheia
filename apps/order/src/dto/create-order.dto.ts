import {
  IsEnum,
  IsUUID,
  IsNumber,
  IsString,
  Min,
  MaxLength,
  IsOptional,
  registerDecorator,
  ValidationOptions,
} from 'class-validator';
import { Type } from 'class-transformer';
import { OrderType } from '../entity/product-order.entity';

export function IsDecimalWithOneOrTwoDP(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isDecimalWithOneOrTwoDP',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          if (typeof value !== 'number') return false;
          const stringValue = value.toString();
          // 정수 또는 소수점 첫째자리나 둘째자리까지의 숫자 허용
          return /^-?\d+(\.\d{1,2})?$/.test(stringValue);
        },
        defaultMessage() {
          return `${propertyName} must be a number with up to 2 decimal places`;
        },
      },
    });
  };
}

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
