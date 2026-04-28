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
  UseInterceptors,
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
import { RestCache } from '../common/decorators/rest-cache.decorator';
import { RestEtagInterceptor } from '../common/interceptors/rest-etag.interceptor';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@ApiTags('categories')
@Controller('api/categories')
@UseInterceptors(RestEtagInterceptor)
@UsePipes(new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }))
export class CategoriesApiController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  @RestCache(3600)
  @ApiOperation({ summary: 'Список категорий' })
  @ApiOkResponse({ description: 'Страница коллекции, заголовок Link' })
  @ApiBadRequestResponse()
  async list(
    @Query() query: PaginationQueryDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { page, limit, skip } = normalizePagination(query);
    const { data, total } = await this.categoriesService.findManyPaged(skip, limit);
    setPaginationLinkHeader(req, res, page, limit, total);
    return data;
  }

  @Get(':id/exhibits/:exhibitId')
  @RestCache(3600)
  @ApiOperation({ summary: 'Один экспонат в контексте категории' })
  @ApiOkResponse({ description: 'Экспонат' })
  @ApiNotFoundResponse()
  findOneExhibit(
    @Param('id', ParseIntPipe) categoryId: number,
    @Param('exhibitId', ParseIntPipe) exhibitId: number,
  ) {
    return this.categoriesService.findExhibitInCategory(categoryId, exhibitId);
  }

  @Get(':id/exhibits')
  @RestCache(3600)
  @ApiOperation({ summary: 'Экспонаты категории' })
  @ApiOkResponse({ description: 'Страница экспонатов' })
  @ApiBadRequestResponse()
  @ApiNotFoundResponse()
  async listExhibits(
    @Param('id', ParseIntPipe) categoryId: number,
    @Query() query: PaginationQueryDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { page, limit, skip } = normalizePagination(query);
    const { data, total } = await this.categoriesService.findExhibitsForCategory(
      categoryId,
      skip,
      limit,
    );
    setPaginationLinkHeader(req, res, page, limit, total);
    return data;
  }

  @Get(':id')
  @RestCache(3600)
  @ApiOperation({ summary: 'Одна категория' })
  @ApiOkResponse({ description: 'Категория' })
  @ApiNotFoundResponse()
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.categoriesService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Создать категорию' })
  @ApiCreatedResponse({ description: 'Созданная категория' })
  @ApiBadRequestResponse()
  @ApiConflictResponse()
  create(@Body() dto: CreateCategoryDto) {
    return this.categoriesService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Частично обновить категорию' })
  @ApiOkResponse({ description: 'Обновлённая категория' })
  @ApiBadRequestResponse()
  @ApiNotFoundResponse()
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCategoryDto) {
    return this.categoriesService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Удалить категорию' })
  @ApiOkResponse({ description: 'Удалённая категория' })
  @ApiNotFoundResponse()
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.categoriesService.remove(id);
  }
}
