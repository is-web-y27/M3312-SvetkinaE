import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, Redirect, Render } from '@nestjs/common';
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
    const isAuth = auth === '1' || auth === 'true';
    return {
      title: 'Экспонаты',
      isAuth,
      exhibits: await this.exhibitsService.findAll(),
      active: { exhibits: true },
    };
  }

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

  @Post()
  @Redirect('/exhibits')
  async createPage(@Body() body: ExhibitBody) {
    await this.exhibitsService.create({
      title: body.title,
      description: body.description,
      categoryId: Number(body.categoryId),
    });
  }

  @Post(':id/edit')
  @Redirect('/exhibits')
  async updatePage(@Param('id', ParseIntPipe) id: number, @Body() body: ExhibitBody) {
    await this.exhibitsService.update(id, {
      title: body.title,
      description: body.description,
      categoryId: Number(body.categoryId),
    });
  }

  @Post(':id/delete')
  @Redirect('/exhibits')
  async deletePage(@Param('id', ParseIntPipe) id: number) {
    await this.exhibitsService.remove(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() body: ExhibitBody) {
    return this.exhibitsService.update(id, {
      title: body.title,
      description: body.description,
      categoryId: Number(body.categoryId),
    });
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.exhibitsService.remove(id);
  }
}
