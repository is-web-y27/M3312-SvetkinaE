import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { Request, Response } from 'express';

@Catch()
export class AppHttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(AppHttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();
    const isApi = req.originalUrl.startsWith('/api');
    const prefersHtml = req.accepts('html') && !isApi;

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const body = exception.getResponse();
      const message =
        typeof body === 'string'
          ? body
          : Array.isArray((body as { message?: unknown }).message)
            ? ((body as { message: string[] }).message.join(', ') ?? exception.message)
            : ((body as { message?: string }).message ?? exception.message);

      if (status === HttpStatus.NOT_FOUND && prefersHtml) {
        return res.status(404).render('pages/error', {
          title: 'Не найдено',
          message,
          isAuth: res.locals?.isAuth ?? false,
          userName: res.locals?.userName ?? 'Гость',
        });
      }

      if (
        (status === HttpStatus.UNAUTHORIZED || status === HttpStatus.FORBIDDEN) &&
        prefersHtml
      ) {
        const returnUrl = encodeURIComponent(req.originalUrl || '/');
        return res.redirect(HttpStatus.FOUND, `/auth/login?returnUrl=${returnUrl}`);
      }

      return res.status(status).json(
        typeof body === 'object' && body !== null && !Array.isArray(body)
          ? body
          : { statusCode: status, message },
      );
    }

    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      if (exception.code === 'P2025') {
        if (prefersHtml) {
          return res.status(404).render('pages/error', {
            title: 'Не найдено',
            message: 'Запись не найдена',
            isAuth: res.locals?.isAuth ?? false,
            userName: res.locals?.userName ?? 'Гость',
          });
        }
        return res.status(404).json({ statusCode: 404, message: 'Запись не найдена' });
      }
      if (exception.code === 'P2002') {
        return res.status(409).json({
          statusCode: 409,
          message: 'Конфликт уникальности данных',
        });
      }
    }

    if (!(exception instanceof HttpException)) {
      this.logger.error(
        exception instanceof Error ? exception.stack ?? exception.message : String(exception),
      );
    }

    return res.status(500).json({
      statusCode: 500,
      message: 'Внутренняя ошибка сервера',
    });
  }
}
