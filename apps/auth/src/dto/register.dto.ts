import { IsAlphanumeric, IsEmail, IsNotEmpty, IsString, IsStrongPassword, Length, MaxLength } from 'class-validator';

export class RegisterDto {
  /**
   * 로그인 시 사용할 아이디 (username)
   * @example 'myusername'
   */
  @IsAlphanumeric() // 알파벳과 숫자만 허용
  @Length(4, 20)
  username: string;

  /**
   * 이메일 주소
   * @example 'myuser@example.com'
   */
  @IsEmail()
  @MaxLength(255)
  email: string;

  /**
   * 사용자 이름
   * @example 'My Name'
   */
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  /**
   * 로그인 시 사용할 비밀번호
   * 8자 이상, 소문자, 대문자, 숫자, 특수문자 각각 1개 이상
   * @example 'MyP@ssw0rd!'
   */
  @IsString()
  @MaxLength(255)
  @IsStrongPassword({ minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1 })
  password: string;
}
