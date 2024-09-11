import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { Observable } from 'rxjs';

import { ValidateAccessTokenResponseDto } from './dto/validate-access-token-response.dto';

interface AuthService {
  validateAccessToken(data: { accessToken: string }): Observable<ValidateAccessTokenResponseDto>;
}

@Injectable()
export class GrpcAuthService implements OnModuleInit {
  constructor(
    @Inject('AUTH_PACKAGE')
    private readonly client: ClientGrpc,
  ) {}

  private authService: AuthService;

  onModuleInit() {
    this.authService = this.client.getService<AuthService>('AuthService');
  }

  validateToken(token: string) {
    return this.authService.validateAccessToken({ accessToken: token });
  }
}
