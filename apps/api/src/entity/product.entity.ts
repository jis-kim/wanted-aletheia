import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum TransactionPurpose {
  FOR_SALE = '판매용', // 판매자 입장에서 판매용 -> 소비자가 구매 가능
  FOR_PURCHASE = '구매용', // 구매용 -> 소비자가 판매 가능
}

@Entity()
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', { length: 255 })
  name: string;

  @Column('decimal', { precision: 5, scale: 2 })
  purity: number; // 순도 - 99.9, 99.99

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column('decimal', { precision: 10, scale: 2 })
  stockAmount: number; // 재고량

  @Column({
    type: 'enum',
    enum: TransactionPurpose,
  })
  transactionPurpose: TransactionPurpose;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
