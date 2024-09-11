import { LoggerService } from '@app/logger';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AllExceptionsFilter } from './common/filter/all-exceptions.filter';
import { ApiResponseInterceptor } from './common/interceptor/api-response.interceptor';
import { OrderModule } from './order.module';
import { ConfigService } from '@nestjs/config';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

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
  const configService = app.get(ConfigService);
  const grpcPort = configService.get<number>('GRPC_PORT', 50052);
  const grpcHost = configService.get<string>('GRPC_HOST', '0.0.0.0');

  // gRPC 마이크로서비스 설정 - 요구사항에 자원 서버 grpc 포트 실행이 명시되어 있음.
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      package: 'auth',
      protoPath: 'proto/auth.proto',
      url: `${grpcHost}:${grpcPort}`, // server listen
    },
  });
  app.setGlobalPrefix('api');

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

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  await app.startAllMicroservices();
  await app.listen(process.env.REST_API_PORT || 9999);
}
bootstrap();
