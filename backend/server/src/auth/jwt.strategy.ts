import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import type { Role } from '@prisma/client';
import { Strategy, ExtractJwt } from 'passport-jwt';
import type { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import type { JwtFromRequestFunction } from 'passport-jwt';
import type { JwtPayloadDTO } from './jwt-payload';
import { AuthService } from './auth.service';

function cookieExtractor(): JwtFromRequestFunction {
  return (req: Request) => req?.cookies?.access_token ?? null;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly config: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        cookieExtractor(),
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayloadDTO) {
    const user = await this.authService.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
