import { LoggerService } from '@app/logger';
import { LoggerInterceptor } from '@app/logger/logger.interceptor';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { OrderModule } from './order.module';
import { ValidationPipe } from '@nestjs/common';

const config = new DocumentBuilder()
  .setTitle('Aletheia API')
  .setDescription('금 거래소 서비스: Aletheia 주문 API 문서')
  .setVersion('1.0')
  .addTag('Aletheia')
  .build();

async function bootstrap() {
  const app = await NestFactory.create(OrderModule, {
    logger: new LoggerService(),
  });

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const logger = app.get(LoggerService);
  app.useLogger(logger);
  app.useGlobalInterceptors(new LoggerInterceptor(logger));

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  await app.listen(process.env.REST_API_PORT || 3000);
}
bootstrap();
