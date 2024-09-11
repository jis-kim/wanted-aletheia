import { Controller, Post, Body } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { ApiConflictResponse, ApiOperation, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';

import { AuthService } from './auth.service';
import { LoginResponseDto } from './dto/login-response.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshResponseDto } from './dto/refresh-response.dto';
import { RefreshDto } from './dto/refresh.dto';
import { RegisterDto } from './dto/register.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * 회원가입 API
   *
   * @param registerDto
   * @returns
   */
  @ApiOperation({ description: '회원가입을 수행한다.' })
  @ApiConflictResponse({ description: 'Username or email 이 이미 존재할 경우' })
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto.username, registerDto.email, registerDto.name, registerDto.password);
  }

  /**
   * 로그인 API
   *
   * @param loginDto
   * @returns
   */
  @ApiUnauthorizedResponse({ description: 'password 가 일치하지 않을 경우' })
  @Post('login')
  async login(@Body() loginDto: LoginDto): Promise<LoginResponseDto> {
    return this.authService.login(loginDto.username, loginDto.password);
  }

  /**
   * 토큰 갱신 API
   *
   * @returns
   */
  @ApiUnauthorizedResponse({ description: 'Refresh token 이 유효하지 않을 경우' })
  @Post('refresh')
  async refresh(@Body() { refreshToken }: RefreshDto): Promise<RefreshResponseDto> {
    return this.authService.refresh(refreshToken);
  }

  /**
   * grpc 통신으로 받은 access token 유효성 검사
   *
   * @param data
   * @returns
   */
  @GrpcMethod('AuthService', 'ValidateAccessToken')
  async validateAccessToken(data: { accessToken: string }) {
    return this.authService.validateAccessToken(data.accessToken);
  }
}
