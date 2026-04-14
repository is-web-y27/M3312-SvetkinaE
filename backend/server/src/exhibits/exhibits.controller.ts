import { Body, Controller, Get, Param, ParseIntPipe, Post, Query, Render, Res } from '@nestjs/common';
import type { Response } from 'express';
import { authRedirectSuffix, isAuthQuery } from '../common/auth-query';
import { ExhibitsService } from './exhibits.service';

type ExhibitBody = {
  title: string;
  description: string;
  categoryId: string;
};

@Controller('exhibits')
export class ExhibitsController {
  constructor(private readonly exhibitsService: ExhibitsService) {}

  @Get()
  @Render('pages/exhibits')
  async findAllPage(@Query('auth') auth?: string) {
    const isAuth = isAuthQuery(auth);
    return {
      title: 'Экспонаты',
      isAuth,
      userName: 'Гость',
      exhibits: await this.exhibitsService.findAll(),
      active: { exhibits: true },
    };
  }

  @Get('add')
  @Render('pages/exhibit-form')
  async addPage(@Query('auth') auth?: string) {
    const isAuth = isAuthQuery(auth);
    return {
      title: 'Добавить экспонат',
      action: '/exhibits',
      exhibit: null,
      categories: await this.exhibitsService.getCategories(),
      active: { exhibits: true },
      isAuth,
      userName: 'Гость',
    };
  }

  @Get(':id')
  @Render('pages/exhibit-details')
  async findOnePage(@Param('id', ParseIntPipe) id: number, @Query('auth') auth?: string) {
    const isAuth = isAuthQuery(auth);
    return {
      title: 'Карточка экспоната',
      exhibit: await this.exhibitsService.findOne(id),
      active: { exhibits: true },
      isAuth,
      userName: 'Гость',
    };
  }

  @Get(':id/edit')
  @Render('pages/exhibit-form')
  async editPage(@Param('id', ParseIntPipe) id: number, @Query('auth') auth?: string) {
    const isAuth = isAuthQuery(auth);
    return {
      title: 'Редактировать экспонат',
      action: `/exhibits/${id}/edit`,
      exhibit: await this.exhibitsService.findOne(id),
      categories: await this.exhibitsService.getCategories(),
      active: { exhibits: true },
      isAuth,
      userName: 'Гость',
    };
  }

  @Post()
  async createPage(
    @Body() body: ExhibitBody,
    @Res() res: Response,
    @Query('auth') auth?: string,
  ) {
    await this.exhibitsService.create({
      title: body.title,
      description: body.description,
      categoryId: Number(body.categoryId),
    });
    return res.redirect(302, `/exhibits${authRedirectSuffix(auth)}`);
  }

  @Post(':id/edit')
  async updatePage(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: ExhibitBody,
    @Res() res: Response,
    @Query('auth') auth?: string,
  ) {
    await this.exhibitsService.update(id, {
      title: body.title,
      description: body.description,
      categoryId: Number(body.categoryId),
    });
    return res.redirect(302, `/exhibits${authRedirectSuffix(auth)}`);
  }

  @Post(':id/delete')
  async deletePage(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
    @Query('auth') auth?: string,
  ) {
    await this.exhibitsService.remove(id);
    return res.redirect(302, `/exhibits${authRedirectSuffix(auth)}`);
  }
}
