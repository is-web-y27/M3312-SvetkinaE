import * as bcrypt from 'bcrypt';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Role, User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

type JwtPayload = { sub: number; email: string; role: Role };

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, plainPassword: string): Promise<User> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Неверная пара email/пароль');
    }
    const ok = await bcrypt.compare(plainPassword, user.passwordHash);
    if (!ok) {
      throw new UnauthorizedException('Неверная пара email/пароль');
    }
    return user;
  }

  async register(email: string, plainPassword: string): Promise<User> {
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new UnauthorizedException('Пользователь с таким email уже есть');
    }
    const hash = await bcrypt.hash(plainPassword, 10);
    return this.prisma.user.create({
      data: { email, passwordHash: hash, role: Role.USER },
    });
  }

  signToken(user: User): string {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };
    return this.jwtService.sign(payload);
  }

  async findById(id: number): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }
}
