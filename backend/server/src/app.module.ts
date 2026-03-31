import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { ExhibitsModule } from './exhibits/exhibits.module';
import { NewsModule } from './news/news.module';
import { ReviewsModule } from './reviews/reviews.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), PrismaModule, ExhibitsModule, NewsModule, ReviewsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
