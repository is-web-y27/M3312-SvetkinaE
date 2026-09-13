import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ElapsedTimeInterceptor } from './common/interceptors/elapsed-time.interceptor';
import { AuthModule } from './auth/auth.module';
import { OptionalUserMiddleware } from './auth/optional-user.middleware';
import { AuthController } from './auth/auth.controller';
import { PrismaModule } from './prisma/prisma.module';
import { ExhibitsModule } from './exhibits/exhibits.module';
import { ExhibitsController } from './exhibits/exhibits.controller';
import { NewsModule } from './news/news.module';
import { NewsController } from './news/news.controller';
import { ReviewsModule } from './reviews/reviews.module';
import { ReviewsController } from './reviews/reviews.controller';
import { CategoriesModule } from './categories/categories.module';
import { VisitorsModule } from './visitors/visitors.module';
import { MuseumGraphqlModule } from './graphql/museum-graphql.module';
import { StorageModule } from './storage/storage.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule.forRootAsync(),
    CacheModule.register({
      isGlobal: true,
      ttl: 8000,
      max: 300,
    }),
    StorageModule,
    PrismaModule,
    ExhibitsModule,
    NewsModule,
    ReviewsModule,
    CategoriesModule,
    VisitorsModule,
    MuseumGraphqlModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    OptionalUserMiddleware,
    { provide: APP_INTERCEPTOR, useClass: ElapsedTimeInterceptor },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(OptionalUserMiddleware)
      .forRoutes(
        AppController,
        ExhibitsController,
        NewsController,
        ReviewsController,
        AuthController,
      );
  }
}
