import {
  Injectable,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import type { Observable } from 'rxjs';
import { User, Role } from '@prisma/client';
import type { Request } from 'express';
import { firstValueFrom, isObservable } from 'rxjs';
import { SECURED_KEY, IS_PUBLIC_KEY, SecuredMode } from './auth.constants';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  override getRequest(context: ExecutionContext): Request {
    if (context.getType<string>() === 'graphql') {
      const gql = GqlExecutionContext.create(context).getContext<{ req?: Request }>();
      return gql.req as Request;
    }
    return context.switchToHttp().getRequest();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic === true) {
      return true;
    }

    const secured = this.reflector.getAllAndOverride<SecuredMode | undefined>(SECURED_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (secured === undefined) {
      return true;
    }

    let ok: boolean;
    try {
      const raw = super.canActivate(context);
      if (isObservable(raw)) {
        ok = await firstValueFrom(raw);
      } else {
        ok = await (raw as Promise<boolean>);
      }
    } catch {
      throw new UnauthorizedException('Требуется вход в систему');
    }

    if (!ok) {
      throw new UnauthorizedException('Требуется вход в систему');
    }

    const req = this.getRequest(context);
    const user = req.user as User | undefined;
    if (secured === SecuredMode.ADMIN && user?.role !== Role.ADMIN) {
      throw new ForbiddenException('Требуется роль администратора');
    }

    return true;
  }
}
