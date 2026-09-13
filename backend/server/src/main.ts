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
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.use(cookieParser());

  const corsOrigins =
    process.env.CORS_ORIGINS?.split(',')
      .map((s) => s.trim())
      .filter(Boolean) ?? ['http://localhost:3000', 'http://127.0.0.1:3000'];
  app.enableCors({
    origin: corsOrigins.length ? corsOrigins : true,
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With'],
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
  });

  app.useGlobalFilters(new AppHttpExceptionFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Шаблоны и static лежат в server/views и server/public (не в dist/).
  const appRoot = process.cwd();
  app.useStaticAssets(join(appRoot, 'public'));
  app.setBaseViewsDir(join(appRoot, 'views'));
  app.setViewEngine('hbs');
  hbs.registerPartials(join(appRoot, 'views', 'partials'));

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Музей технологий API')
    .setDescription('REST API по доменной модели ЛР 2–4')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Токен из POST /auth/login или cookie access_token (для Swagger введите raw JWT).',
      },
      'jwt-auth',
    )
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
