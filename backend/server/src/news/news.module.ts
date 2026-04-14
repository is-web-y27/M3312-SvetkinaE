import { Module } from '@nestjs/common';
import { NewsApiController } from './news-api.controller';
import { NewsController } from './news.controller';
import { NewsService } from './news.service';

@Module({
  controllers: [NewsController, NewsApiController],
  providers: [NewsService],
  exports: [NewsService],
})
export class NewsModule {}
