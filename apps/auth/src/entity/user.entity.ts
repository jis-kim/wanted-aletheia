import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

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

  @Column({ length: 255 })
  password: string;

  @Column({ length: 255, nullable: true })
  refreshToken: string;
}
