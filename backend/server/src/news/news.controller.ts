import {
  Body,
  Controller,
  Get,
  MessageEvent,
  Param,
  ParseIntPipe,
  Post,
  Render,
  Res,
  Sse,
} from '@nestjs/common';
import type { Response } from 'express';
import { Observable, Subject } from 'rxjs';
import { RequireJwt } from '../auth/decorators/secured.decorators';
import { NewsService } from './news.service';

type NewsBody = {
  title: string;
  text: string;
  exhibitId?: string;
};

@Controller('news')
export class NewsController {
  private readonly events = new Subject<MessageEvent>();

  constructor(private readonly newsService: NewsService) {}

  @Sse('stream')
  stream(): Observable<MessageEvent> {
    return this.events.asObservable();
  }

  @Get()
  @Render('pages/news')
  async findAllPage() {
    return {
      title: 'Новости',
      news: await this.newsService.findAll(),
      active: { news: true },
    };
  }

  @RequireJwt()
  @Get('add')
  @Render('pages/news-form')
  async addPage() {
    return {
      title: 'Добавить новость',
      action: '/news',
      item: null,
      exhibits: await this.newsService.getExhibits(),
      active: { news: true },
    };
  }

  @Get(':id')
  @Render('pages/news-details')
  async findOnePage(@Param('id', ParseIntPipe) id: number) {
    return {
      title: 'Карточка новости',
      item: await this.newsService.findOne(id),
      active: { news: true },
    };
  }

  @RequireJwt()
  @Get(':id/edit')
  @Render('pages/news-form')
  async editPage(@Param('id', ParseIntPipe) id: number) {
    return {
      title: 'Редактировать новость',
      action: `/news/${id}/edit`,
      item: await this.newsService.findOne(id),
      exhibits: await this.newsService.getExhibits(),
      active: { news: true },
    };
  }

  @RequireJwt()
  @Post()
  async createPage(@Body() body: NewsBody, @Res() res: Response) {
    const created = await this.newsService.create({
      title: body.title,
      text: body.text,
      exhibitId: body.exhibitId ? Number(body.exhibitId) : null,
    });
    this.events.next({
      data: JSON.stringify({
        message: `Добавлена новость #${created.id}: ${created.title}`,
      }),
    });
    return res.redirect(302, '/news');
  }

  @RequireJwt()
  @Post(':id/edit')
  async updatePage(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: NewsBody,
    @Res() res: Response,
  ) {
    const updated = await this.newsService.update(id, {
      title: body.title,
      text: body.text,
      exhibitId: body.exhibitId ? Number(body.exhibitId) : null,
    });
    this.events.next({
      data: JSON.stringify({
        message: `Обновлена новость #${updated.id}: ${updated.title}`,
      }),
    });
    return res.redirect(302, '/news');
  }

  @RequireJwt()
  @Post(':id/delete')
  async deletePage(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
    await this.newsService.remove(id);
    this.events.next({
      data: JSON.stringify({ message: `Удалена новость #${id}` }),
    });
    return res.redirect(302, '/news');
  }
}
