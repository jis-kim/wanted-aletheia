import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';

import { OrderService } from './order.service';
import { ApiTags } from '@nestjs/swagger';
import { CreateOrderDto } from './dto/create-order.dto';
import { CreateOrderResponseDto } from './dto/create-order-response.dto';

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
  getOrderDetail(): string {
    return 'Get Order Detail';
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
