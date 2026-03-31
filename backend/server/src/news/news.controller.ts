import { Body, Controller, Delete, Get, MessageEvent, Param, ParseIntPipe, Patch, Post, Query, Redirect, Render, Sse } from '@nestjs/common';
import { Observable, Subject } from 'rxjs';
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
    const isAuth = auth === '1' || auth === 'true';
    return {
      title: 'Новости',
      isAuth,
      news: await this.newsService.findAll(),
      active: { news: true },
    };
  }

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

  @Post()
  @Redirect('/news')
  async createPage(@Body() body: NewsBody) {
    const created = await this.newsService.create({
      title: body.title,
      text: body.text,
      exhibitId: body.exhibitId ? Number(body.exhibitId) : null,
    });
    this.events.next({
      data: {
        message: `Добавлена новость #${created.id}: ${created.title}`,
      },
    });
  }

  @Post(':id/edit')
  @Redirect('/news')
  async updatePage(@Param('id', ParseIntPipe) id: number, @Body() body: NewsBody) {
    const updated = await this.newsService.update(id, {
      title: body.title,
      text: body.text,
      exhibitId: body.exhibitId ? Number(body.exhibitId) : null,
    });
    this.events.next({
      data: {
        message: `Обновлена новость #${updated.id}: ${updated.title}`,
      },
    });
  }

  @Post(':id/delete')
  @Redirect('/news')
  async deletePage(@Param('id', ParseIntPipe) id: number) {
    await this.newsService.remove(id);
    this.events.next({
      data: {
        message: `Удалена новость #${id}`,
      },
    });
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() body: NewsBody) {
    return this.newsService.update(id, {
      title: body.title,
      text: body.text,
      exhibitId: body.exhibitId ? Number(body.exhibitId) : null,
    });
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.newsService.remove(id);
  }
}
