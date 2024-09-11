import { DatabaseModule } from '@app/database';
import { LoggerModule } from '@app/logger';
import { Module } from '@nestjs/common';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { User } from './entity/user.entity';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    DatabaseModule.forRoot('apps/auth/.env', [User]),
    TypeOrmModule.forFeature([User]),
    LoggerModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
    }),
    ConfigModule,
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
