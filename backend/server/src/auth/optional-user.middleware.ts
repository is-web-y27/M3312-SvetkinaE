import { Injectable, NestMiddleware } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import type { NextFunction } from 'express';
import type { Request } from 'express';
import type { Response } from 'express';
import { Role } from '@prisma/client';

export type BrowserUserLite = {
  email: string;
  role: Role;
};

/** Пробрасывает пользователя из JWT cookie в шаблоны MVC (просмотры с cookie после входа). */
@Injectable()
export class OptionalUserMiddleware implements NestMiddleware {
  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  use(req: Request, res: Response, next: NextFunction) {
    const token = (req.cookies as { access_token?: string } | undefined)?.access_token;
    if (token) {
      try {
        const payload = this.jwt.verify(token, {
          secret: this.config.getOrThrow<string>('JWT_SECRET'),
        }) as {
          email?: string;
          role?: Role;
        };
        if (payload.email && payload.role) {
          res.locals.user = { email: payload.email, role: payload.role };
        }
      } catch {
        /* токен просрочен или повреждён — гостевой UI */
      }
    }
    res.locals.isAuth = !!res.locals.user;
    res.locals.userName = res.locals.user?.email ?? 'Гость';
    next();
  }
}
