import { DatabaseModule } from '@app/database';
import { Module } from '@nestjs/common';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [DatabaseModule.forRoot('apps/auth/.env')],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
