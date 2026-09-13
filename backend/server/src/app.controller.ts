import { Controller, Get, Render } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Render('pages/index')
  async getIndexPage() {
    return {
      title: 'Музей технологий будущего',
      news: await this.appService.getNews(),
      exhibits: await this.appService.getExhibits(),
      active: { home: true },
    };
  }

  @Get('/index.html')
  @Render('pages/index')
  async getIndexHtml() {
    return this.getIndexPage();
  }

  @Get('/about')
  @Render('pages/about')
  getAboutPage() {
    return { title: 'О нас', active: { about: true } };
  }

  @Get('/gallery')
  @Render('pages/gallery')
  getGalleryPage() {
    return { title: 'Галерея', active: { gallery: true } };
  }

  @Get('/contacts')
  @Render('pages/contacts')
  getContactsPage() {
    return { title: 'Контакты', active: { contacts: true } };
  }

  @Get('/feedback')
  @Render('pages/feedback')
  getFeedbackPage() {
    return { title: 'Обратная связь', active: { feedback: true } };
  }
}
