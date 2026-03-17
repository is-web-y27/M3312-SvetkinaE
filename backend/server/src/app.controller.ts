import { Controller, Get, Query, Render } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Render('pages/index')
  getIndexPage(@Query('auth') auth?: string) {
    const isAuth = auth === '1' || auth === 'true';
    return {
      title: 'Музей технологий будущего',
      isAuth,
      userName: 'Гость',
      news: this.appService.getNews(),
      exhibits: this.appService.getExhibits(),
      active: { home: true },
    };
  }

  @Get('/index.html')
  @Render('pages/index')
  getIndexHtml(@Query('auth') auth?: string) {
    return this.getIndexPage(auth);
  }

  @Get('/about')
  @Render('pages/about')
  getAboutPage(@Query('auth') auth?: string) {
    const isAuth = auth === '1' || auth === 'true';
    return { title: 'О нас', isAuth, userName: 'Гость', active: { about: true } };
  }

  @Get('/exhibits')
  @Render('pages/exhibits')
  getExhibitsPage(@Query('auth') auth?: string) {
    const isAuth = auth === '1' || auth === 'true';
    return {
      title: 'Экспонаты',
      isAuth,
      userName: 'Гость',
      exhibits: this.appService.getExhibits(),
      active: { exhibits: true },
    };
  }

  @Get('/news')
  @Render('pages/news')
  getNewsPage(@Query('auth') auth?: string) {
    const isAuth = auth === '1' || auth === 'true';
    return { title: 'Новости', isAuth, userName: 'Гость', news: this.appService.getNews(), active: { news: true } };
  }

  @Get('/reviews')
  @Render('pages/reviews')
  getReviewsPage(@Query('auth') auth?: string) {
    const isAuth = auth === '1' || auth === 'true';
    return { title: 'Отзывы', isAuth, userName: 'Гость', active: { reviews: true } };
  }

  @Get('/gallery')
  @Render('pages/gallery')
  getGalleryPage(@Query('auth') auth?: string) {
    const isAuth = auth === '1' || auth === 'true';
    return { title: 'Галерея', isAuth, userName: 'Гость', active: { gallery: true } };
  }

  @Get('/contacts')
  @Render('pages/contacts')
  getContactsPage(@Query('auth') auth?: string) {
    const isAuth = auth === '1' || auth === 'true';
    return { title: 'Контакты', isAuth, userName: 'Гость', active: { contacts: true } };
  }

  @Get('/feedback')
  @Render('pages/feedback')
  getFeedbackPage(@Query('auth') auth?: string) {
    const isAuth = auth === '1' || auth === 'true';
    return { title: 'Обратная связь', isAuth, userName: 'Гость', active: { feedback: true } };
  }
}
