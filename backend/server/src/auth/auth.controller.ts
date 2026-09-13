import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Render,
  Res,
  UnauthorizedException,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import type { Response } from 'express';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { Public } from './decorators/public.decorator';

const COOKIE_OPTS = {
  httpOnly: true,
  path: '/' as const,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
};

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Public()
  @Get('login')
  @ApiOperation({ summary: 'Страница входа (HTML)' })
  @Render('pages/login')
  loginPage(@Query('returnUrl') returnUrl?: string) {
    return {
      title: 'Вход',
      returnUrl: returnUrl ?? '/',
    };
  }

  /** JSON: выдаём тело с access_token для Swagger / Postman. */
  @Public()
  @Post('login')
  @ApiBody({ type: LoginDto })
  async loginPostJson(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.issueSession(dto.email, dto.password, res);
  }

  /** Форма x-www-urlencoded с сайта museums */
  @Public()
  @Post('login/form')
  @ApiOperation({ summary: 'Вход через HTML-форму' })
  async loginForm(
    @Body() body: { email: string; password: string; returnUrl?: string },
    @Res() res: Response,
  ): Promise<void> {
    await this.finalizeMvcLogin(body.email, body.password, body.returnUrl ?? '/', res);
  }

  private async finalizeMvcLogin(
    email: string,
    password: string,
    returnUrl: string,
    res: Response,
  ): Promise<void> {
    const user = await this.auth.validateUser(email, password);
    const token = this.auth.signToken(user);
    res.cookie('access_token', token, {
      ...COOKIE_OPTS,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.redirect(returnUrl.startsWith('/') ? returnUrl : '/');
  }

  private async issueSession(email: string, password: string, res: Response) {
    const user = await this.auth.validateUser(email, password);
    const token = this.auth.signToken(user);
    res.cookie('access_token', token, {
      ...COOKIE_OPTS,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return { access_token: token, email: user.email, role: user.role };
  }

  @Public()
  @Get('register')
  @ApiOperation({ summary: 'Страница регистрации (HTML)' })
  @Render('pages/register')
  registerPage(@Query('error') error?: string) {
    const messages: Record<string, string> = {
      email_taken: 'Пользователь с таким email уже зарегистрирован.',
    };
    return {
      title: 'Регистрация',
      error: error ? (messages[error] ?? 'Не удалось зарегистрироваться') : null,
    };
  }

  @Public()
  @Post('register/form')
  @ApiOperation({ summary: 'Регистрация через HTML-форму' })
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async registerForm(@Body() dto: RegisterDto, @Res() res: Response): Promise<void> {
    try {
      const user = await this.auth.register(dto.email, dto.password);
      const token = this.auth.signToken(user);
      res.cookie('access_token', token, {
        ...COOKIE_OPTS,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
      res.redirect('/');
    } catch (e) {
      if (e instanceof UnauthorizedException) {
        res.redirect(302, '/auth/register?error=email_taken');
        return;
      }
      throw e;
    }
  }

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Регистрация пользователя (роль USER)' })
  async register(@Body() dto: RegisterDto) {
    await this.auth.register(dto.email, dto.password);
    return { ok: true };
  }

  @Public()
  @Post('logout')
  @ApiOperation({ summary: 'Выход из системы (сброс cookie)' })
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('access_token', { path: '/', sameSite: 'lax', httpOnly: true });
    return { ok: true };
  }

  @Public()
  @Post('logout/form')
  logoutForm(@Res() res: Response): void {
    res.clearCookie('access_token', { path: '/', sameSite: 'lax', httpOnly: true });
    res.redirect('/');
  }
}
