import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { CreateOrderDto, CreateOrderResponseDto, OrderDetailResponseDto } from './dto';
import { OrderService } from './order.service';

@ApiTags('Order')
@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get()
  getOrderList(): string {
    return 'Get Order List';
  }

  @Post()
  createOrder(@Body() createOrderDto: CreateOrderDto): Promise<CreateOrderResponseDto> {
    const userId = 'f565b0c5-a02b-409c-beb5-052cc7088303';
    return this.orderService.createOrder(userId, createOrderDto);
  }

  @Get(':id')
  getOrderDetail(@Param('id') orderId: string): Promise<OrderDetailResponseDto> {
    const userId = 'f565b0c5-a02b-409c-beb5-052cc7088303';
    return this.orderService.getOrderDetail(userId, orderId);
  }

  @Patch(':id')
  updateOrder(): string {
    return 'Update Order Detail';
  }

  @Delete(':id')
  deleteOrder(): string {
    return 'Delete Order';
  }

  @Patch(':id/status')
  updateOrderStatus(): string {
    return 'Update Order Status By Id';
  }
}
