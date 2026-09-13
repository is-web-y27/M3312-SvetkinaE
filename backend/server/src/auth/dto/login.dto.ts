import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'user@museum.local' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'secretpass' })
  @IsString()
  @MinLength(4)
  password: string;
}
