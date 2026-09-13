/** Публичный маршрут (без проверки JWT). */
export const IS_PUBLIC_KEY = 'auth_public';

/** Требование к авторизации на маршруте. */
export const SECURED_KEY = 'auth_secured';

export enum SecuredMode {
  /** Любой вошедший пользователь (USER или ADMIN). */
  JWT = 'jwt',
  /** Только роль ADMIN. */
  ADMIN = 'admin',
}
