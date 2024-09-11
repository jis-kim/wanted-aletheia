// grpc-auth.guard.ts
import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { catchError, map, Observable } from 'rxjs';
import { GrpcAuthService } from '../../grpc-auth.service';

@Injectable()
export class GrpcAuthGuard implements CanActivate {
  constructor(private grpcAuthService: GrpcAuthService) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException('No token provided');
    }
    return this.validateToken(request, token);
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

  private validateToken(request: any, token: string): Observable<boolean> {
    return this.grpcAuthService.validateToken(token).pipe(
      map((response) => {
        if (response.isValid) {
          const { payload } = response;
          request.user = payload;
          return true;
        } else {
          throw new UnauthorizedException('Invalid access token');
        }
      }),
      catchError((error) => {
        console.error('Token validation error:', error);
        throw new UnauthorizedException('Failed to validate token');
      }),
    );
  }
}
