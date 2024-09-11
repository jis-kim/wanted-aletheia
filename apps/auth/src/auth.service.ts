import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entity/user.entity';
import { compare, hash } from 'bcryptjs';
import { RegisterResponseDto } from './dto/register-response.dto';
import { JwtService } from '@nestjs/jwt';
import { LoginResponseDto } from './dto/login-response.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly jwtService: JwtService,
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
      const payload = { username: user.username, sub: user.id };
      const accessToken = this.jwtService.sign(payload, { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN });
      const refreshToken = this.jwtService.sign(payload, { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN });

      user.refreshToken = refreshToken;
      await this.usersRepository.update(user.id, { refreshToken });

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
    throw new UnauthorizedException('Invalid credentials');
  }
}
