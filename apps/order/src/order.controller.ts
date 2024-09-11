import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Res } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { Response } from 'express';

import { CheckIsUUIDPipe } from './common/pipe/check-is-uuid.pipe';
import { CreateOrderDto, CreateOrderResponseDto, OrderDetailResponseDto } from './dto';
import { SearchOrderDto } from './dto/order-search.dto';
import { UpdateOrderResponseDto } from './dto/update-order-response.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { UpdateStatusResponseDto } from './dto/update-status-response.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { OrderService } from './order.service';
import { SearchOrderResponseDto } from './dto/search-order-response.dto';

@ApiBearerAuth()
@ApiTags('Order')
@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  /**
   * 주문 목록 조회 api
   *
   * @returns
   */
  @ApiOperation({ description: '쿼리에 따라 다른 주문 리스트를 가져온다.' })
  @Get()
  getOrderList(@Query() query: SearchOrderDto): Promise<SearchOrderResponseDto> {
    const userId = 'f565b0c5-a02b-409c-beb5-052cc7088303';
    return this.orderService.searchOrder(userId, query);
  }

  /**
   * 주문 생성 api
   *
   * @param createOrderDto
   * @param response
   * @returns CreateOrderResponseDto
   */
  @ApiNotFoundResponse({ description: 'product가 존재하지 않을 경우' })
  @Post()
  async createOrder(
    @Body() createOrderDto: CreateOrderDto,
    @Res() response: Response,
  ): Promise<CreateOrderResponseDto> {
    const userId = 'f565b0c5-a02b-409c-beb5-052cc7088303';
    const result: CreateOrderResponseDto = await this.orderService.createOrder(userId, createOrderDto);
    response.header('Location', `/api/orders/${result.id}`).send(result);
    return result;
  }

  /**
   * 주문 상세 조회 api
   *
   * @param orderId
   * @returns
   */
  @ApiNotFoundResponse({ description: 'order가 존재하지 않을 경우, order를 생성한 사용자가 아닐 경우' })
  @ApiParam({ name: 'id', description: '조회할 주문 ID' })
  @Get(':id')
  getOrderDetail(@Param('id', CheckIsUUIDPipe) orderId: string): Promise<OrderDetailResponseDto> {
    const userId = 'f565b0c5-a02b-409c-beb5-052cc7088303';
    return this.orderService.getOrderDetail(userId, orderId);
  }

  /**
   * 주문 수정 api
   *
   * @returns
   */
  @ApiOperation({ description: '배송지 관련 정보등 한정적인 정보만 수정 가능' })
  @ApiNotFoundResponse({ description: 'order가 존재하지 않을 경우, order를 생성한 사용자가 아닐 경우' })
  @ApiBadRequestResponse({ description: '이미 발송 완료, 혹은 수령 완료 상태일 경우' })
  @Patch(':id')
  updateOrder(
    @Param('id', CheckIsUUIDPipe) orderId: string,
    @Body() updateOrderDto: UpdateOrderDto,
  ): Promise<UpdateOrderResponseDto> {
    const userId = 'f565b0c5-a02b-409c-beb5-052cc7088303';
    return this.orderService.updateOrder(userId, orderId, updateOrderDto);
  }

  /**
   * 주문 삭제 api
   *
   * @returns
   */
  @ApiOperation({ description: 'soft delete' })
  @ApiNotFoundResponse({ description: 'order가 존재하지 않을 경우, order를 생성한 사용자가 아닐 경우' })
  @ApiBadRequestResponse({ description: '주문 완료 이후의 상태일 경우' })
  @Delete(':id')
  deleteOrder(@Param('id', CheckIsUUIDPipe) orderId: string): Promise<void> {
    const userId = 'f565b0c5-a02b-409c-beb5-052cc7088303';
    return this.orderService.deleteOrder(userId, orderId);
  }

  /**
   * 주문 상태 변경 api
   *
   * @returns
   */
  @ApiNotFoundResponse({ description: 'order가 존재하지 않을 경우, order를 생성한 사용자가 아닐 경우' })
  @ApiBadRequestResponse({ description: 'type과 맞지 않는 상태이거나 변경할 수 없는 상태일 경우' })
  @Patch(':id/status')
  updateOrderStatus(
    @Param('id', CheckIsUUIDPipe) orderId: string,
    @Body() updateStatusDto: UpdateStatusDto,
  ): Promise<UpdateStatusResponseDto> {
    const userId = 'f565b0c5-a02b-409c-beb5-052cc7088303';
    return this.orderService.updateOrderStatus(userId, orderId, updateStatusDto);
  }
}
