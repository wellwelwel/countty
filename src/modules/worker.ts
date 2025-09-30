import type {
  CounttyOptions,
  CounttyReturn,
  Env,
  RateLimitConfig,
} from '../@types.js';
import { createRateLimiter } from '../configs/rate-limit.js';
import { response } from '../helpers/response.js';
import { createDurableObject } from './counter.js';
import { backup } from './routes/backup.js';
import { create } from './routes/create.js';
import { list } from './routes/list.js';
import { remove } from './routes/remove.js';
import { reset } from './routes/reset.js';
import { views } from './routes/views.js';

export const createCountty: (options?: CounttyOptions) => CounttyReturn = (
  options
) => {
  const stubName = (options || Object.create(null)).table || 'countty';

  const rateLimitOptions: CounttyOptions['rateLimit'] =
    options?.rateLimit || Object.create(null);

  const rateLimitConfig: RateLimitConfig = {
    maxRequests: rateLimitOptions?.maxRequests || 20,
    windowMs: rateLimitOptions?.windowMs || 10000,
    blockDurationMs: rateLimitOptions?.blockDurationMs || 10000,
  };

  const Countty = createDurableObject(stubName);

  const rateLimiter = createRateLimiter(rateLimitConfig);

  const createContext = (request: Request, env: Env) => {
    const id = env.countty.idFromName(stubName);
    const stub = env.countty.get(id);
    const context = { request, env, stub };

    return {
      rateLimit: rateLimiter(request),
      router: {
        backup: () => backup(context),
        create: () => create(context),
        list: () => list(context),
        views: () => views(context),
        remove: () => remove(context),
        reset: () => reset(context),
      },
    };
  };

  const Worker: ExportedHandler<Env> = {
    async fetch(request: Request, env: Env): Promise<Response> {
      const { router, rateLimit } = createContext(request, env);
      const { backup, create, remove, reset, list, views } = router;

      const headers = Object.freeze({
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Max-Age': '1800',
        'Content-Type': 'application/json; charset=utf-8',
        'X-RateLimit-Limit': String(rateLimitConfig.maxRequests),
        'X-RateLimit-Remaining': String(rateLimit.remaining),
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
      });

      if (!rateLimit.available)
        return response({
          response: {
            message: 'Request limit exceeded. Please try again later.',
          },
          status: 429,
          headers,
        });

      try {
        const url = new URL(request.url);

        if (request.method === 'OPTIONS')
          return new Response(null, { status: 204, headers });

        /** Routes */
        switch (url.pathname) {
          case '/create':
            return create();
          case '/views':
            return views();
          case '/remove':
            return remove();
          case '/backup':
            return backup();
          case '/list':
            return list();
          case '/reset':
            return reset();
          default:
            return response({
              response: { message: 'Not found.' },
              status: 404,
              headers,
            });
        }
      } catch (error) {
        console.error(error);

        return response({
          response: { message: 'Oops! Internal error.' },
          status: 500,
        });
      }
    },
  };

  return {
    Worker,
    Countty,
    createContext,
  };
};
