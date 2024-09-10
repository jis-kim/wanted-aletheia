import { Type } from 'class-transformer';
import { IsUUID, IsString, MaxLength, IsOptional } from 'class-validator';

import { IsValidQuantity } from '../common/decorator/is-valid-quantity';

// POST /order API Request DTO
export class CreateOrderDto {
  /**
   * 주문한 상품 ID
   * @example 6e6dc34f-8715-492f-b03b-03e25faadcb4
   */
  @IsUUID()
  productId: string;

  /**
   * 주문 수량 (g)
   * - 소수점 2자리까지 허용
   * @example 100.5
   */
  @IsValidQuantity()
  @Type(() => Number)
  quantity: number;

  /**
   * 배송지 주소
   * @example 서울시 강남구 테헤란로 427
   */
  @IsString()
  @MaxLength(512)
  shippingAddress: string;

  /**
   * 배송지 이름
   * @example 홍길동
   */
  @IsString()
  @MaxLength(255)
  shippingName: string;

  /**
   * 배송지 전화번호
   * @example 010-1234-5678
   */
  @IsString()
  @MaxLength(32)
  shippingPhone: string;

  /**
   * 배송 메모
   * @example 문 앞에 놓아주세요
   */
  @IsString()
  @MaxLength(300)
  @IsOptional()
  shippingMemo?: string;
}
