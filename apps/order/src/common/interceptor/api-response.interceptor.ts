import { LoggerService } from '@app/logger';
import { NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { ApiResponseDto } from '../../dto';

export class ApiResponseInterceptor<T> implements NestInterceptor<T, ApiResponseDto<T>> {
  constructor(private readonly logger: LoggerService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponseDto<T>> {
    const request = context.switchToHttp().getRequest();
    const method = request.method;
    const url = request.url;
    const now = Date.now();

    return next.handle().pipe(
      map((data) => {
        const response = context.switchToHttp().getResponse();
        const statusCode = response.statusCode;
        const responseTime = Date.now() - now;

        this.logger.log(`[${method}] ${url} ${statusCode} ${responseTime}ms`, 'APIInterceptor');
        return {
          success: true,
          statusCode: context.switchToHttp().getResponse().statusCode,
          message: 'Success',
          data,
        };
      }),
    );
  }
}
