import { DatabaseModule } from '@app/database';
import { Module } from '@nestjs/common';

import { ApiController } from './api.controller';
import { ApiService } from './api.service';
import { LoggerModule } from '@app/logger';

@Module({
  imports: [DatabaseModule.forRoot('apps/api/.env'), LoggerModule],
  controllers: [ApiController],
  providers: [ApiService],
})
export class ApiModule {}
