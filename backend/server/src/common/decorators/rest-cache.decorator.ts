import { SetMetadata } from '@nestjs/common';

/** Max-Age в секундах для Cache-Control + ETag (клиентское кэширование). */
export const REST_CACHE_MAX_AGE = 'rest_cache_max_age_sec';

export const RestCache = (maxAgeSeconds: number) => SetMetadata(REST_CACHE_MAX_AGE, maxAgeSeconds);
