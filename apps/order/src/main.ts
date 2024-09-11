import { LoggerService } from '@app/logger';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AllExceptionsFilter } from './common/filter/all-exceptions.filter';
import { ApiResponseInterceptor } from './common/interceptor/api-response.interceptor';
import { OrderModule } from './order.module';
import { GrpcAuthGuard } from './common/guard/grpc-auth.guard';

const config = new DocumentBuilder()
  .setTitle('Aletheia API')
  .setDescription('금 거래소 서비스: Aletheia 주문 API 문서')
  .setVersion('1.0')
  .addTag('Aletheia')
  .addBearerAuth()
  .build();

async function bootstrap() {
  const app = await NestFactory.create(OrderModule, {
    logger: new LoggerService(),
  });

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const logger = app.get(LoggerService);
  app.useLogger(logger);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.useGlobalFilters(new AllExceptionsFilter(logger));
  app.useGlobalInterceptors(new ApiResponseInterceptor(logger));

  await app.listen(process.env.REST_API_PORT || 3000);
}
bootstrap();
