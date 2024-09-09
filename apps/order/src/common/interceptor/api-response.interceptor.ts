import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ApiResponseType<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data?: T;
}

@Injectable()
export class ApiResponseInterceptor<T> implements NestInterceptor<T, ApiResponseType<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponseType<T>> {
    return next.handle().pipe(
      map((data) => ({
        success: true,
        statusCode: context.switchToHttp().getResponse().statusCode,
        message: 'Success',
        data,
      })),
    );
  }
}
