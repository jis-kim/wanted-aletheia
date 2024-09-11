import { Type } from 'class-transformer';
import { IsDate, IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';

import { OrderType } from '../entity/product-order.entity';

export class SearchOrderDto {
  /**
   * 주문일자
   * 해당 일자 ~ 최근에 주문한 주문 목록을 조회한다.
   */
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  date?: Date;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50)
  @Type(() => Number)
  limit?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(2147483647)
  @Type(() => Number)
  offset?: number;

  @IsOptional()
  @IsEnum(OrderType)
  invoiceType?: OrderType;
}
