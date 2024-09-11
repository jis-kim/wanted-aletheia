import { IsAlphanumeric, IsString, Length } from 'class-validator';

export class LoginDto {
  /**
   * 로그인 시 사용할 username
   * @example 'myusername'
   */
  @IsAlphanumeric()
  @Length(4, 20)
  username: string;

  /**
   * 로그인 시 사용할 password
   * @example 'MyP@ssw0rd!'
   */
  @IsString()
  @Length(8, 255)
  password: string;
}
