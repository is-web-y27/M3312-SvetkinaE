import { Module } from '@nestjs/common';
import { CategoriesApiController } from './categories-api.controller';
import { CategoriesService } from './categories.service';

@Module({
  controllers: [CategoriesApiController],
  providers: [CategoriesService],
})
export class CategoriesModule {}
