import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { PaginationQueryDto, normalizePagination } from '../common/dto/pagination-query.dto';
import { setPaginationLinkHeader } from '../common/pagination-links';
import { CreateNewsDto } from './dto/create-news.dto';
import { UpdateNewsDto } from './dto/update-news.dto';
import { NewsService } from './news.service';
import { RequireJwt } from '../auth/decorators/secured.decorators';

@ApiTags('news')
@Controller('api/news')
@UsePipes(new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }))
export class NewsApiController {
  constructor(private readonly newsService: NewsService) {}

  @Get()
  @ApiOperation({ summary: 'Список новостей' })
  @ApiOkResponse({ description: 'Страница коллекции, заголовок Link' })
  @ApiBadRequestResponse()
  async list(
    @Query() query: PaginationQueryDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { page, limit, skip } = normalizePagination(query);
    const { data, total } = await this.newsService.findManyPaged(skip, limit);
    setPaginationLinkHeader(req, res, page, limit, total);
    return data;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Одна новость' })
  @ApiOkResponse({ description: 'Новость с экспонатом' })
  @ApiNotFoundResponse()
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.newsService.findOne(id);
  }

  @RequireJwt()
  @ApiBearerAuth('jwt-auth')
  @Post()
  @ApiOperation({ summary: 'Создать новость' })
  @ApiCreatedResponse({ description: 'Созданная новость' })
  @ApiBadRequestResponse()
  create(@Body() dto: CreateNewsDto) {
    return this.newsService.create({
      title: dto.title,
      text: dto.text,
      exhibitId: dto.exhibitId ?? null,
    });
  }

  @RequireJwt()
  @ApiBearerAuth('jwt-auth')
  @Patch(':id')
  @ApiOperation({ summary: 'Частично обновить новость' })
  @ApiOkResponse({ description: 'Обновлённая новость' })
  @ApiBadRequestResponse()
  @ApiNotFoundResponse()
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateNewsDto) {
    return this.newsService.update(id, {
      title: dto.title,
      text: dto.text,
      exhibitId: dto.exhibitId,
    });
  }

  @RequireJwt()
  @ApiBearerAuth('jwt-auth')
  @Delete(':id')
  @ApiOperation({ summary: 'Удалить новость' })
  @ApiOkResponse({ description: 'Удалённая новость' })
  @ApiNotFoundResponse()
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.newsService.remove(id);
  }
}
