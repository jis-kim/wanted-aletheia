import { LoggerService } from '@app/logger';
import { LoggerInterceptor } from '@app/logger/logger.interceptor';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AuthModule } from './auth.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';

const config = new DocumentBuilder()
  .setTitle('Aletheia API')
  .setDescription('금 거래소 서비스: Aletheia 인증 API 문서')
  .setVersion('1.0')
  .addTag('Aletheia')
  .build();

async function bootstrap() {
  const app = await NestFactory.create(AuthModule, {
    logger: new LoggerService(),
  });
  const configService = app.get(ConfigService);
  const grpcPort = configService.get<number>('GRPC_PORT', 50051);

  // gRPC 마이크로서비스 설정
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      package: 'auth',
      protoPath: 'proto/auth.proto',
      url: `0.0.0.0:${grpcPort}`, // gRPC 포트 설정
    },
  });

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const logger = app.get(LoggerService);
  app.useLogger(logger);
  app.useGlobalInterceptors(new LoggerInterceptor(logger));

  await app.startAllMicroservices();
  await app.listen(configService.get<number>('REST_API_PORT', 3001));
}
bootstrap();
