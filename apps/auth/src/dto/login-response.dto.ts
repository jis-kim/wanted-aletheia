export class LoginResponseDto {
  /**
   * access token
   */
  accessToken: string;

  /**
   * refresh token
   */
  refreshToken: string;

  /**
   * 로그인한 사용자 정보
   */
  user: {
    id: string;
    username: string;
    email: string;
    name: string;
  };
}
