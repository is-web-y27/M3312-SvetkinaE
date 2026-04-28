import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import hbs from 'hbs';
import { AppHttpExceptionFilter } from './filters/app-http-exception.filter';
import type { NextFunction, Response } from 'express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useGlobalFilters(new AppHttpExceptionFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.setViewEngine('hbs');
  hbs.registerPartials(join(__dirname, '..', 'views', 'partials'));
  hbs.registerHelper('authQ', (isAuth: boolean) => (isAuth ? '?auth=1' : ''));

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Музей технологий API')
    .setDescription('REST API по доменной модели ЛР 2–4')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  const expressApp = app.getHttpAdapter().getInstance();
  expressApp.use('/graphql', (_req: unknown, res: Response, next: NextFunction) => {
    const started = Date.now();
    const prevEnd = res.end.bind(res);
    res.end = (...args: unknown[]) => {
      try {
        if (!res.getHeader('x-elapsed-time')) {
          res.setHeader('X-Elapsed-Time', String(Date.now() - started));
        }
      } catch {
        //
      }
      return prevEnd(...args);
    };
    next();
  });

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') ?? 3000;
  await app.listen(port);
}
bootstrap();
