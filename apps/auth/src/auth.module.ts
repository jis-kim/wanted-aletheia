import { DatabaseModule } from '@app/database';
import { Module } from '@nestjs/common';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LoggerModule } from '@app/logger';
import { User } from './entity/user.entity';

@Module({
  imports: [DatabaseModule.forRoot('apps/auth/.env', [User]), LoggerModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
