import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, Redirect, Render } from '@nestjs/common';
import { ReviewsService } from './reviews.service';

type ReviewBody = {
  rating: string;
  text: string;
  visitorId: string;
  exhibitId: string;
};

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get()
  @Render('pages/reviews')
  async findAllPage(@Query('auth') auth?: string) {
    const isAuth = auth === '1' || auth === 'true';
    return {
      title: 'Отзывы',
      isAuth,
      reviews: await this.reviewsService.findAll(),
      active: { reviews: true },
    };
  }

  @Get('add')
  @Render('pages/review-form')
  async addPage() {
    const formData = await this.reviewsService.getFormData();
    return {
      title: 'Добавить отзыв',
      action: '/reviews',
      item: null,
      ...formData,
      active: { reviews: true },
    };
  }

  @Get(':id')
  @Render('pages/review-details')
  async findOnePage(@Param('id', ParseIntPipe) id: number) {
    return {
      title: 'Карточка отзыва',
      item: await this.reviewsService.findOne(id),
      active: { reviews: true },
    };
  }

  @Get(':id/edit')
  @Render('pages/review-form')
  async editPage(@Param('id', ParseIntPipe) id: number) {
    const formData = await this.reviewsService.getFormData();
    return {
      title: 'Редактировать отзыв',
      action: `/reviews/${id}/edit`,
      item: await this.reviewsService.findOne(id),
      ...formData,
      active: { reviews: true },
    };
  }

  @Post()
  @Redirect('/reviews')
  async createPage(@Body() body: ReviewBody) {
    await this.reviewsService.create({
      rating: Number(body.rating),
      text: body.text,
      visitorId: Number(body.visitorId),
      exhibitId: Number(body.exhibitId),
    });
  }

  @Post(':id/edit')
  @Redirect('/reviews')
  async updatePage(@Param('id', ParseIntPipe) id: number, @Body() body: ReviewBody) {
    await this.reviewsService.update(id, {
      rating: Number(body.rating),
      text: body.text,
      visitorId: Number(body.visitorId),
      exhibitId: Number(body.exhibitId),
    });
  }

  @Post(':id/delete')
  @Redirect('/reviews')
  async deletePage(@Param('id', ParseIntPipe) id: number) {
    await this.reviewsService.remove(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() body: ReviewBody) {
    return this.reviewsService.update(id, {
      rating: Number(body.rating),
      text: body.text,
      visitorId: Number(body.visitorId),
      exhibitId: Number(body.exhibitId),
    });
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.reviewsService.remove(id);
  }
}
