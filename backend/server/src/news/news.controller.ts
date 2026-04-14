import { Body, Controller, Get, MessageEvent, Param, ParseIntPipe, Post, Query, Render, Res, Sse } from '@nestjs/common';
import type { Response } from 'express';
import { Observable, Subject } from 'rxjs';
import { authRedirectSuffix, isAuthQuery } from '../common/auth-query';
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
  async findAllPage(@Query('auth') auth?: string) {
    const isAuth = isAuthQuery(auth);
    return {
      title: 'Новости',
      isAuth,
      userName: 'Гость',
      news: await this.newsService.findAll(),
      active: { news: true },
    };
  }

  @Get('add')
  @Render('pages/news-form')
  async addPage(@Query('auth') auth?: string) {
    const isAuth = isAuthQuery(auth);
    return {
      title: 'Добавить новость',
      action: '/news',
      item: null,
      exhibits: await this.newsService.getExhibits(),
      active: { news: true },
      isAuth,
      userName: 'Гость',
    };
  }

  @Get(':id')
  @Render('pages/news-details')
  async findOnePage(@Param('id', ParseIntPipe) id: number, @Query('auth') auth?: string) {
    const isAuth = isAuthQuery(auth);
    return {
      title: 'Карточка новости',
      item: await this.newsService.findOne(id),
      active: { news: true },
      isAuth,
      userName: 'Гость',
    };
  }

  @Get(':id/edit')
  @Render('pages/news-form')
  async editPage(@Param('id', ParseIntPipe) id: number, @Query('auth') auth?: string) {
    const isAuth = isAuthQuery(auth);
    return {
      title: 'Редактировать новость',
      action: `/news/${id}/edit`,
      item: await this.newsService.findOne(id),
      exhibits: await this.newsService.getExhibits(),
      active: { news: true },
      isAuth,
      userName: 'Гость',
    };
  }

  @Post()
  async createPage(@Body() body: NewsBody, @Res() res: Response, @Query('auth') auth?: string) {
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
    return res.redirect(302, `/news${authRedirectSuffix(auth)}`);
  }

  @Post(':id/edit')
  async updatePage(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: NewsBody,
    @Res() res: Response,
    @Query('auth') auth?: string,
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
    return res.redirect(302, `/news${authRedirectSuffix(auth)}`);
  }

  @Post(':id/delete')
  async deletePage(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
    @Query('auth') auth?: string,
  ) {
    await this.newsService.remove(id);
    this.events.next({
      data: JSON.stringify({ message: `Удалена новость #${id}` }),
    });
    return res.redirect(302, `/news${authRedirectSuffix(auth)}`);
  }
}
