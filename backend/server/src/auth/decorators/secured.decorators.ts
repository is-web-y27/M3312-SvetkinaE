import { SetMetadata } from '@nestjs/common';
import { SECURED_KEY, SecuredMode } from '../auth.constants';

/** Доступ только после входа (любой пользователь с валидным JWT). */
export const RequireJwt = () => SetMetadata(SECURED_KEY, SecuredMode.JWT);

/** Доступ только администратору. */
export const RequireAdmin = () => SetMetadata(SECURED_KEY, SecuredMode.ADMIN);
