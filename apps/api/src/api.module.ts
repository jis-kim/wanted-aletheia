import { Module } from '@nestjs/common';
import { ApiController } from './api.controller';
import { ApiService } from './api.service';
import { DatabaseModule } from '@app/database';

@Module({
  //imports: [DatabaseModule.forRoot(join(__dirname, 'apps', 'api', '.env'))],
  imports: [DatabaseModule.forRoot('apps/api/.env')],
  controllers: [ApiController],
  providers: [ApiService],
})
export class ApiModule {}
