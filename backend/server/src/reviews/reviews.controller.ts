import { Body, Controller, Get, Param, ParseIntPipe, Post, Render, Res } from '@nestjs/common';
import type { Response } from 'express';
import { RequireJwt } from '../auth/decorators/secured.decorators';
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
  async findAllPage() {
    return {
      title: 'Отзывы',
      reviews: await this.reviewsService.findAll(),
      active: { reviews: true },
    };
  }

  @RequireJwt()
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

  @RequireJwt()
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

  @RequireJwt()
  @Post()
  async createPage(@Body() body: ReviewBody, @Res() res: Response) {
    await this.reviewsService.create({
      rating: Number(body.rating),
      text: body.text,
      visitorId: Number(body.visitorId),
      exhibitId: Number(body.exhibitId),
    });
    return res.redirect(302, '/reviews');
  }

  @RequireJwt()
  @Post(':id/edit')
  async updatePage(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: ReviewBody,
    @Res() res: Response,
  ) {
    await this.reviewsService.update(id, {
      rating: Number(body.rating),
      text: body.text,
      visitorId: Number(body.visitorId),
      exhibitId: Number(body.exhibitId),
    });
    return res.redirect(302, '/reviews');
  }

  @RequireJwt()
  @Post(':id/delete')
  async deletePage(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
    await this.reviewsService.remove(id);
    return res.redirect(302, '/reviews');
  }
}
