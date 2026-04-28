import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class ElapsedTimeInterceptor implements NestInterceptor {
  private readonly logger = new Logger(ElapsedTimeInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest();
    const res = context.switchToHttp().getResponse();
    const start = Date.now();

    return next.handle().pipe(
      map((data) => {
        const elapsed = Date.now() - start;
        res.setHeader('X-Elapsed-Time', String(elapsed));
        this.logger.log(`${req.method} ${req.originalUrl ?? req.url} ${elapsed}ms`);

        const url: string = req.originalUrl ?? req.url ?? '';
        const isApiOrGql = url.startsWith('/api') || url.startsWith('/graphql');
        if (!isApiOrGql && req.method === 'GET' && data && typeof data === 'object' && !Buffer.isBuffer(data)) {
          const d = data as Record<string, unknown>;
          const isNestRedirect =
            typeof d.statusCode === 'number' &&
            typeof d.url === 'string' &&
            (d.url.startsWith('/') || d.url.startsWith('http'));
          if (!isNestRedirect) {
            return { ...d, serverElapsedMs: elapsed };
          }
        }
        return data;
      }),
    );
  }
}
