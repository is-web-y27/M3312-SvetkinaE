import type { Role } from '@prisma/client';

/** Подписывается в JWT (payload). */
export type JwtPayloadDTO = {
  sub: number;
  email: string;
  role: Role;
};
