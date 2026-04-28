import {
  Body,
  Controller,
  Delete,
  Get,
  MaxFileSizeValidator,
  ParseFilePipe,
  FileTypeValidator,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UploadedFile,
  Query,
  Req,
  Res,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConflictResponse,
  ApiConsumes,
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
import { StorageService } from '../storage/storage.service';
import { CreateExhibitDto } from './dto/create-exhibit.dto';
import { UpdateExhibitDto } from './dto/update-exhibit.dto';
import { ExhibitsService } from './exhibits.service';

@ApiTags('exhibits')
@Controller('api/exhibits')
@UseInterceptors(RestEtagInterceptor)
@UsePipes(new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }))
export class ExhibitsApiController {
  constructor(
    private readonly exhibitsService: ExhibitsService,
    private readonly storageService: StorageService,
  ) {}

  @Get()
  @RestCache(3600)
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(8000)
  @ApiOperation({ summary: 'Список экспонатов (пагинация, серверный кэш несколько сек, Link, ETag)' })
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
  @RestCache(120)
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
  @RestCache(120)
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
  @RestCache(120)
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
  @RestCache(120)
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

  @Post(':id/cover')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file'],
      properties: { file: { type: 'string', format: 'binary' } },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 2 * 1024 * 1024 },
    }),
  )
  @ApiOperation({ summary: 'Загрузить обложку экспоната в Object Storage и сохранить публичный URL' })
  @ApiOkResponse({ description: 'Обновлённый экспонат' })
  @ApiBadRequestResponse()
  @ApiNotFoundResponse()
  async uploadCover(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 2 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: /^image\/(jpeg|jpg|png|webp|gif)$/i }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    const url = await this.storageService.uploadPublicObject({
      buffer: file.buffer,
      contentType: file.mimetype,
      keyPrefix: `exhibits/${id}`,
    });
    return this.exhibitsService.update(id, { coverImageUrl: url });
  }

  @Get(':id')
  @RestCache(3600)
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
    return this.exhibitsService.create({
      title: dto.title,
      description: dto.description,
      categoryId: dto.categoryId,
      coverImageUrl: dto.coverImageUrl ?? undefined,
    });
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
