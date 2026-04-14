import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class PaginationQueryDto {
  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ default: 10, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}

export function normalizePagination(query: PaginationQueryDto) {
  const page = query.page !== undefined && query.page >= 1 ? query.page : 1;
  const limit =
    query.limit !== undefined && query.limit >= 1 && query.limit <= 100 ? query.limit : 10;
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}
