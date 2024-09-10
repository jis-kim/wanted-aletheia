import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
} from 'typeorm';

import { ProductOrder } from './product-order.entity';

export enum TransactionPurpose {
  FOR_SALE = '판매용', // 판매자 입장에서 판매용 -> 소비자가 구매 가능
  FOR_PURCHASE = '구매용', // 구매용 -> 소비자가 판매 가능
}

/**
 * Product
 * - 상품 정보
 */
@Entity()
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * 상품명
   * - 금
   */
  @Column('varchar', { length: 255, default: '금' })
  name: string;

  @Column('decimal', { precision: 5, scale: 2 })
  purity: number; // 순도 - 99.9, 99.99

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column('decimal', { precision: 10, scale: 2, select: false })
  stockAmount: number;

  @Column({
    type: 'enum',
    enum: TransactionPurpose,
  })
  transactionPurpose: TransactionPurpose;

  @OneToMany(() => ProductOrder, (productOrder) => productOrder.product, {
    cascade: ['soft-remove'],
  })
  orders: ProductOrder[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn({ select: false })
  deletedAt: Date;
}
