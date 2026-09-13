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
import { CreateVisitorDto } from './dto/create-visitor.dto';
import { UpdateVisitorDto } from './dto/update-visitor.dto';
import { VisitorsService } from './visitors.service';
import { RequireAdmin } from '../auth/decorators/secured.decorators';

@ApiTags('visitors')
@Controller('api/visitors')
@UsePipes(new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }))
export class VisitorsApiController {
  constructor(private readonly visitorsService: VisitorsService) {}

  @Get()
  @ApiOperation({ summary: 'Список посетителей' })
  @ApiOkResponse({ description: 'Страница коллекции, заголовок Link' })
  @ApiBadRequestResponse()
  async list(
    @Query() query: PaginationQueryDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { page, limit, skip } = normalizePagination(query);
    const { data, total } = await this.visitorsService.findManyPaged(skip, limit);
    setPaginationLinkHeader(req, res, page, limit, total);
    return data;
  }

  @Get(':id/reviews/:reviewId')
  @ApiOperation({ summary: 'Один отзыв в контексте посетителя' })
  @ApiOkResponse({ description: 'Отзыв' })
  @ApiNotFoundResponse()
  findOneReview(
    @Param('id', ParseIntPipe) visitorId: number,
    @Param('reviewId', ParseIntPipe) reviewId: number,
  ) {
    return this.visitorsService.findReviewForVisitor(visitorId, reviewId);
  }

  @Get(':id/reviews')
  @ApiOperation({ summary: 'Отзывы посетителя' })
  @ApiOkResponse({ description: 'Страница отзывов' })
  @ApiBadRequestResponse()
  @ApiNotFoundResponse()
  async listReviews(
    @Param('id', ParseIntPipe) visitorId: number,
    @Query() query: PaginationQueryDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { page, limit, skip } = normalizePagination(query);
    const { data, total } = await this.visitorsService.findReviewsForVisitor(
      visitorId,
      skip,
      limit,
    );
    setPaginationLinkHeader(req, res, page, limit, total);
    return data;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Один посетитель' })
  @ApiOkResponse({ description: 'Посетитель' })
  @ApiNotFoundResponse()
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.visitorsService.findOne(id);
  }

  @RequireAdmin()
  @ApiBearerAuth('jwt-auth')
  @Post()
  @ApiOperation({ summary: 'Создать посетителя' })
  @ApiCreatedResponse({ description: 'Созданный посетитель' })
  @ApiBadRequestResponse()
  @ApiConflictResponse({ description: 'Email уже занят' })
  create(@Body() dto: CreateVisitorDto) {
    return this.visitorsService.create(dto);
  }

  @RequireAdmin()
  @ApiBearerAuth('jwt-auth')
  @Patch(':id')
  @ApiOperation({ summary: 'Частично обновить посетителя' })
  @ApiOkResponse({ description: 'Обновлённый посетитель' })
  @ApiBadRequestResponse()
  @ApiNotFoundResponse()
  @ApiConflictResponse()
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateVisitorDto) {
    return this.visitorsService.update(id, dto);
  }

  @RequireAdmin()
  @ApiBearerAuth('jwt-auth')
  @Delete(':id')
  @ApiOperation({ summary: 'Удалить посетителя' })
  @ApiOkResponse({ description: 'Удалённый посетитель' })
  @ApiNotFoundResponse()
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.visitorsService.remove(id);
  }
}
