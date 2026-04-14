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
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { PaginationQueryDto, normalizePagination } from '../common/dto/pagination-query.dto';
import { setPaginationLinkHeader } from '../common/pagination-links';
import { CreateExhibitDto } from './dto/create-exhibit.dto';
import { UpdateExhibitDto } from './dto/update-exhibit.dto';
import { ExhibitsService } from './exhibits.service';

@ApiTags('exhibits')
@Controller('api/exhibits')
@UsePipes(new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }))
export class ExhibitsApiController {
  constructor(private readonly exhibitsService: ExhibitsService) {}

  @Get()
  @ApiOperation({ summary: 'Список экспонатов (пагинация, заголовок Link)' })
  @ApiOkResponse({ description: 'Массив экспонатов с категорией' })
  @ApiBadRequestResponse({ description: 'Некорректные query page/limit' })
  async list(
    @Query() query: PaginationQueryDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { page, limit, skip } = normalizePagination(query);
    const { data, total } = await this.exhibitsService.findManyPaged(skip, limit);
    setPaginationLinkHeader(req, res, page, limit, total);
    return data;
  }

  @Get(':id/reviews/:reviewId')
  @ApiOperation({ summary: 'Один отзыв в контексте экспоната' })
  @ApiOkResponse({ description: 'Отзыв' })
  @ApiNotFoundResponse()
  findOneReview(
    @Param('id', ParseIntPipe) exhibitId: number,
    @Param('reviewId', ParseIntPipe) reviewId: number,
  ) {
    return this.exhibitsService.findReviewForExhibit(exhibitId, reviewId);
  }

  @Get(':id/reviews')
  @ApiOperation({ summary: 'Все отзывы экспоната' })
  @ApiOkResponse({ description: 'Страница отзывов' })
  @ApiBadRequestResponse()
  async listReviews(
    @Param('id', ParseIntPipe) exhibitId: number,
    @Query() query: PaginationQueryDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { page, limit, skip } = normalizePagination(query);
    const { data, total } = await this.exhibitsService.findReviewsForExhibit(
      exhibitId,
      skip,
      limit,
    );
    setPaginationLinkHeader(req, res, page, limit, total);
    return data;
  }

  @Get(':id/news/:newsId')
  @ApiOperation({ summary: 'Одна новость в контексте экспоната' })
  @ApiOkResponse({ description: 'Новость' })
  @ApiNotFoundResponse()
  findOneNews(
    @Param('id', ParseIntPipe) exhibitId: number,
    @Param('newsId', ParseIntPipe) newsId: number,
  ) {
    return this.exhibitsService.findNewsForExhibitById(exhibitId, newsId);
  }

  @Get(':id/news')
  @ApiOperation({ summary: 'Все новости экспоната' })
  @ApiOkResponse({ description: 'Страница новостей' })
  @ApiBadRequestResponse()
  async listNews(
    @Param('id', ParseIntPipe) exhibitId: number,
    @Query() query: PaginationQueryDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { page, limit, skip } = normalizePagination(query);
    const { data, total } = await this.exhibitsService.findNewsForExhibit(exhibitId, skip, limit);
    setPaginationLinkHeader(req, res, page, limit, total);
    return data;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Один экспонат' })
  @ApiOkResponse({ description: 'Экспонат с категорией' })
  @ApiNotFoundResponse()
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.exhibitsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Создать экспонат' })
  @ApiCreatedResponse({ description: 'Созданный экспонат' })
  @ApiBadRequestResponse()
  @ApiConflictResponse({ description: 'Конфликт уникальности (редко)' })
  create(@Body() dto: CreateExhibitDto) {
    return this.exhibitsService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Частично обновить экспонат' })
  @ApiOkResponse({ description: 'Обновлённый экспонат' })
  @ApiBadRequestResponse()
  @ApiNotFoundResponse()
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateExhibitDto) {
    return this.exhibitsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Удалить экспонат' })
  @ApiOkResponse({ description: 'Удалённый экспонат' })
  @ApiNotFoundResponse()
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.exhibitsService.remove(id);
  }
}
