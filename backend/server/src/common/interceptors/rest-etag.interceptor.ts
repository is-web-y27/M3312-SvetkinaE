import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { createHash } from 'crypto';
import type { Request, Response } from 'express';
import { Observable, EMPTY, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { REST_CACHE_MAX_AGE } from '../decorators/rest-cache.decorator';

/** ETag + Cache-Control для отмеченных декоратором @RestCache GET-методов REST API. */
@Injectable()
export class RestEtagInterceptor implements NestInterceptor {
  constructor(private readonly reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const maxAgeSec = this.reflector.getAllAndOverride<number>(REST_CACHE_MAX_AGE, [
      context.getHandler(),
      context.getClass(),
    ]);
    const http = context.switchToHttp();
    const req = http.getRequest<Request>();
    const res = http.getResponse<Response>();

    if (!maxAgeSec || req.method !== 'GET') {
      return next.handle();
    }

    return next.handle().pipe(
      switchMap((body) => {
        const payload =
          body === undefined || body === null ? '' : typeof body === 'string' ? body : JSON.stringify(body);
        const hash = createHash('sha1').update(payload).digest('hex');
        const etag = `W/"${hash}"`;

        const inm = req.headers['if-none-match'];
        if (inm === etag) {
          res.status(304).end();
          return EMPTY;
        }

        res.setHeader('ETag', etag);
        res.setHeader('Cache-Control', `public, max-age=${maxAgeSec}`);

        return of(body);
      }),
    );
  }
}
