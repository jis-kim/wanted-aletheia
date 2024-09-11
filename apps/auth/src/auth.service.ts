import { LoggerService } from '@app/logger';
import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { compare, hash } from 'bcryptjs';
import { Repository } from 'typeorm';

import { LoginResponseDto } from './dto/login-response.dto';
import { RefreshResponseDto } from './dto/refresh-response.dto';
import { RegisterResponseDto } from './dto/register-response.dto';
import { User } from './entity/user.entity';
import { TokenPayload } from './type/token-payload.type';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly logger: LoggerService,
  ) {}

  async register(username: string, email: string, name: string, password: string): Promise<RegisterResponseDto> {
    const conflictUser = await this.usersRepository.findOne({
      select: ['username', 'email'],
      where: [{ username }, { email: email }],
    });

    if (conflictUser) {
      if (conflictUser.username === username) {
        throw new ConflictException('Username already exists');
      }
      if (conflictUser.email === email) {
        throw new ConflictException('Email already exists');
      }
    }
    const hashedPassword = await hash(password, 10);

    const result = await this.usersRepository.insert({
      username,
      email,
      name,
      password: hashedPassword,
    });

    return {
      id: result.identifiers[0].id,
      username,
      email,
      name,
    };
  }

  async login(username: string, password: string): Promise<LoginResponseDto> {
    const user = await this.usersRepository.findOne({
      select: ['id', 'name', 'username', 'email', 'password'],
      where: { username },
    });
    if (user && (await compare(password, user.password))) {
      const payload: TokenPayload = { username: user.username, sub: user.id, name: user.name };
      const accessToken = this.jwtService.sign(payload, { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN });
      const refreshToken = this.jwtService.sign(payload, { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN });

      user.refreshToken = refreshToken;
      await this.usersRepository.update(user.id, { refreshToken });

      this.logger.log(`User ${user.username} logged in.`);
      return {
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          name: user.name,
        },
      };
    }
    this.logger.warn(`Failed login attempt for user: ${username}`);
    throw new UnauthorizedException('Invalid credentials');
  }

  async refresh(token: string): Promise<RefreshResponseDto> {
    // token 유효성 검증
    let payload: TokenPayload;
    try {
      payload = this.jwtService.verify(token);
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }

    const user = await this.usersRepository.findOne({ select: ['refreshToken'], where: { id: payload.sub } });
    if (user && user.refreshToken === token) {
      const newAccessToken = this.jwtService.sign(
        { username: payload.username, sub: payload.sub, name: payload.name },
        { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN },
      );
      return {
        accessToken: newAccessToken,
      };
    }
    throw new UnauthorizedException('Invalid token');
  }

  async validateAccessToken(token: string) {
    try {
      const payload = this.jwtService.verify(token);
      this.logger.log('validateAccessToken success', 'GRPC');
      return {
        isValid: true,
        payload: {
          sub: payload.sub,
          username: payload.username,
          name: payload.name,
        },
      };
    } catch (error) {
      this.logger.error('validateAccessToken failed', error, 'GRPC');
      return { isValid: false, userId: '' };
    }
  }
}
