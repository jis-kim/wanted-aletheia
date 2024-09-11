import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entity/user.entity';
import { hash } from 'bcryptjs';
import { RegisterResponseDto } from './dto/register-response.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async register(username: string, email: string, name: string, password: string): Promise<RegisterResponseDto> {
    const conflictUser = await this.usersRepository.findOne({
      select: ['username', 'email'],
      where: [{ username }, { email: email }],
    });

    if (conflictUser) {
      if (conflictUser.username === username) {
        throw new UnauthorizedException('Username already exists');
      }
      if (conflictUser.email === email) {
        throw new UnauthorizedException('Email already exists');
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
}
