import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * login 시 사용할 username
   */
  @Column({ length: 128, unique: true })
  username: string;

  @Column({ length: 255, unique: true })
  email: string;

  /**
   * 사용자 이름, 실명
   */
  @Column({ length: 255 })
  name: string;

  @Column({ length: 255, select: false })
  password: string;

  @Column({ length: 255, nullable: true, select: false })
  refreshToken: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn({ select: false })
  deletedAt: Date;
}
