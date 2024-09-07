import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { DatabaseModule } from '@app/database';

@Module({
  imports: [DatabaseModule.forRoot('apps/auth/.env')],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
