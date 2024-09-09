import { OrderStatus, OrderType } from '../entity/product-order.entity';

export class OrderDetailResponseDto {
  id: string;
  orderNumber: string;
  type: OrderType;
  status: OrderStatus;
  product: {
    id: string;
    name: string;
    purity: number;
    price: number;
  };
  quantity: number;
  totalPrice: number;
  orderDate: Date;
  updatedAt: Date;
  shippingAddress: string;
  shippingName: string;
  shippingPhone: string;
  shippingMemo: string;
}
