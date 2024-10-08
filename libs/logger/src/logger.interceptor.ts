import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Response } from 'express';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { LoggerService } from './logger.service';

@Injectable()
export class LoggerInterceptor implements NestInterceptor {
  constructor(private logger: LoggerService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const method = request.method;
    const url = request.url;
    const now = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const response = context.switchToHttp().getResponse();
          const statusCode = response.statusCode;
          const responseTime = Date.now() - now;

          this.logger.log(`[${method}] ${url} ${statusCode} ${responseTime}ms`, 'APIInterceptor');
        },
        error: (error) => {
          const response: Response = context.switchToHttp().getResponse();
          const statusCode = response.statusCode;
          const responseTime = Date.now() - now;

          this.logger.error(
            `[${method}] ${url} ${error.status || statusCode} ${responseTime}ms - Error: ${error.message}\nrequest: ${JSON.stringify(request.body)}`,
            error.stack,
            'APIInterceptor',
          );
        },
      }),
    );
  }
}
