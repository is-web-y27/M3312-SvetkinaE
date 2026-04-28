import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ElapsedTimeInterceptor } from './common/interceptors/elapsed-time.interceptor';
import { PrismaModule } from './prisma/prisma.module';
import { ExhibitsModule } from './exhibits/exhibits.module';
import { NewsModule } from './news/news.module';
import { ReviewsModule } from './reviews/reviews.module';
import { CategoriesModule } from './categories/categories.module';
import { VisitorsModule } from './visitors/visitors.module';
import { MuseumGraphqlModule } from './graphql/museum-graphql.module';
import { StorageModule } from './storage/storage.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
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
    { provide: APP_INTERCEPTOR, useClass: ElapsedTimeInterceptor },
  ],
})
export class AppModule {}
