import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateExhibitDto {
  @ApiProperty({ example: 'Квантовый модуль' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'Описание экспоната' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @IsInt()
  categoryId: number;

  @ApiPropertyOptional({ example: 'https://storage.yandexcloud.net/bucket/key' })
  @IsOptional()
  @IsString()
  coverImageUrl?: string | null;
}
