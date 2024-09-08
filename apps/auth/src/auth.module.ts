import { DatabaseModule } from '@app/database';
import { Module } from '@nestjs/common';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LoggerModule } from '@app/logger';

@Module({
  imports: [DatabaseModule.forRoot('apps/auth/.env'), LoggerModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
