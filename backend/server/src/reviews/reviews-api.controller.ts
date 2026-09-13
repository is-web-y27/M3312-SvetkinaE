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
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { ReviewsService } from './reviews.service';
import { RequireJwt } from '../auth/decorators/secured.decorators';

@ApiTags('reviews')
@Controller('api/reviews')
@UsePipes(new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }))
export class ReviewsApiController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get()
  @ApiOperation({ summary: 'Список отзывов' })
  @ApiOkResponse({ description: 'Страница коллекции, заголовок Link' })
  @ApiBadRequestResponse()
  async list(
    @Query() query: PaginationQueryDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { page, limit, skip } = normalizePagination(query);
    const { data, total } = await this.reviewsService.findManyPaged(skip, limit);
    setPaginationLinkHeader(req, res, page, limit, total);
    return data;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Один отзыв' })
  @ApiOkResponse({ description: 'Отзыв с посетителем и экспонатом' })
  @ApiNotFoundResponse()
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.reviewsService.findOne(id);
  }

  @RequireJwt()
  @ApiBearerAuth('jwt-auth')
  @Post()
  @ApiOperation({ summary: 'Создать отзыв' })
  @ApiCreatedResponse({ description: 'Созданный отзыв' })
  @ApiBadRequestResponse()
  create(@Body() dto: CreateReviewDto) {
    return this.reviewsService.create(dto);
  }

  @RequireJwt()
  @ApiBearerAuth('jwt-auth')
  @Patch(':id')
  @ApiOperation({ summary: 'Частично обновить отзыв' })
  @ApiOkResponse({ description: 'Обновлённый отзыв' })
  @ApiBadRequestResponse()
  @ApiNotFoundResponse()
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateReviewDto) {
    return this.reviewsService.update(id, dto);
  }

  @RequireJwt()
  @ApiBearerAuth('jwt-auth')
  @Delete(':id')
  @ApiOperation({ summary: 'Удалить отзыв' })
  @ApiOkResponse({ description: 'Удалённый отзыв' })
  @ApiNotFoundResponse()
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.reviewsService.remove(id);
  }
}
