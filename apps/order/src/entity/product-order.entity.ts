import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { Product } from './product.entity';

export enum OrderStatus {
  ORDERED = '주문 완료',
  DEPOSITED = '입금 완료', // 소비자 구매 주문
  SHIPPED = '발송 완료', // 소비자 구매 주문
  TRANSFERRED = '송금 완료', // 소비자 판매 주문
  RECEIVED = '수령 완료', // 소비자 판매 주문
}

export enum OrderType {
  BUY = '구매',
  SELL = '판매',
}

/**
 * ProductOrder
 * - 주문 정보
 */
@Entity()
export class ProductOrder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * human readable한 주문 번호
   * B(S)-timestamp-randomNumber
   * @example B-1725802729-123456
   */
  @Column({ length: 20, unique: true })
  orderNumber: string;

  /**
   * 구매/판매 주문
   */
  @Column({ type: 'enum', enum: OrderType })
  type: OrderType;

  /**
   * 주문한 유저 ID (key)
   * 서버 B의 유저 ID를 참조 (UUID 형태 유지)
   */
  @Column('varchar', { length: 36 })
  userId: string; // 서버 B의 유저 ID를 참조 (UUID 형태 유지)

  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.ORDERED })
  status: OrderStatus;

  @ManyToOne(() => Product)
  @JoinColumn()
  product: Product;

  @Column()
  productId: string;

  /**
   * 주문 수량 (g)
   * - 소수점 2자리까지 허용
   */
  @Column('decimal', { precision: 10, scale: 2 })
  quantity: number;

  /**
   * 총 주문 금액
   */
  @Column('decimal', { precision: 10, scale: 2 })
  totalPrice: number;

  /**
   * 배송 정보
   * - 주소, 이름, 전화번호, 메모
   */
  @Column('varchar', { length: 255 })
  shippingAddress: string;

  @Column('varchar', { length: 255 })
  shippingName: string;

  @Column('varchar', { length: 255 })
  shippingPhone: string;

  @Column('varchar', { length: 255 })
  shippingMemo: string;

  @CreateDateColumn()
  orderDate: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
