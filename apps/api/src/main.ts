import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { ApiModule } from './api.module';

const config = new DocumentBuilder()
  .setTitle('Aletheia API')
  .setDescription('금 거래소 서비스: Aletheia API 문서')
  .setVersion('1.0')
  .addTag('Aletheia')
  .build();

async function bootstrap() {
  const app = await NestFactory.create(ApiModule);

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3000);
}
bootstrap();
