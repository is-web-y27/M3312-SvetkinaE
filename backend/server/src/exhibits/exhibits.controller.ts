import { Body, Controller, Get, Param, ParseIntPipe, Post, Render, Res } from '@nestjs/common';
import type { Response } from 'express';
import { RequireJwt } from '../auth/decorators/secured.decorators';
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
  async findAllPage() {
    return {
      title: 'Экспонаты',
      exhibits: await this.exhibitsService.findAll(),
      active: { exhibits: true },
    };
  }

  @RequireJwt()
  @Get('add')
  @Render('pages/exhibit-form')
  async addPage() {
    return {
      title: 'Добавить экспонат',
      action: '/exhibits',
      exhibit: null,
      categories: await this.exhibitsService.getCategories(),
      active: { exhibits: true },
    };
  }

  @Get(':id')
  @Render('pages/exhibit-details')
  async findOnePage(@Param('id', ParseIntPipe) id: number) {
    return {
      title: 'Карточка экспоната',
      exhibit: await this.exhibitsService.findOne(id),
      active: { exhibits: true },
    };
  }

  @RequireJwt()
  @Get(':id/edit')
  @Render('pages/exhibit-form')
  async editPage(@Param('id', ParseIntPipe) id: number) {
    return {
      title: 'Редактировать экспонат',
      action: `/exhibits/${id}/edit`,
      exhibit: await this.exhibitsService.findOne(id),
      categories: await this.exhibitsService.getCategories(),
      active: { exhibits: true },
    };
  }

  @RequireJwt()
  @Post()
  async createPage(@Body() body: ExhibitBody, @Res() res: Response) {
    await this.exhibitsService.create({
      title: body.title,
      description: body.description,
      categoryId: Number(body.categoryId),
    });
    return res.redirect(302, '/exhibits');
  }

  @RequireJwt()
  @Post(':id/edit')
  async updatePage(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: ExhibitBody,
    @Res() res: Response,
  ) {
    await this.exhibitsService.update(id, {
      title: body.title,
      description: body.description,
      categoryId: Number(body.categoryId),
    });
    return res.redirect(302, '/exhibits');
  }

  @RequireJwt()
  @Post(':id/delete')
  async deletePage(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
    await this.exhibitsService.remove(id);
    return res.redirect(302, '/exhibits');
  }
}
