import type { Role } from '@prisma/client';

declare global {
  namespace Express {
    interface Locals {
      user?: {
        email: string;
        role: Role;
      };
      /** Заполнено OptionalUserMiddleware */
      isAuth?: boolean;
      userName?: string;
    }
  }
}

export {};
