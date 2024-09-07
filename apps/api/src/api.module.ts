import { DatabaseModule } from '@app/database';
import { Module } from '@nestjs/common';

import { ApiController } from './api.controller';
import { ApiService } from './api.service';

@Module({
  imports: [DatabaseModule.forRoot('apps/api/.env')],
  controllers: [ApiController],
  providers: [ApiService],
})
export class ApiModule {}
