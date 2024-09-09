import { LoggerService } from '@app/logger';
import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';

import { ApiResponseDto } from '../../dto';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly logger: LoggerService) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const message =
      status < HttpStatus.INTERNAL_SERVER_ERROR && exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal server error';

    const errorResponse: ApiResponseDto<undefined> = {
      success: false,
      statusCode: status,
      message: typeof message === 'string' ? message : (message as any).message,
    };

    this.logger.error(
      `[${request.method}] ${request.url} ${status} - Error: ${JSON.stringify(errorResponse)}`,
      (exception as Error).stack,
    );

    response.status(status).json(errorResponse);
  }
}
