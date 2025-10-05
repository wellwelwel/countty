import type {
  CounttyOptions,
  CounttyReturn,
  Env,
  RateLimitConfig,
  RouteOptions,
} from '../@types.js';
import { GlobalCounttyOptions } from '../configs/global.js';
import { createRateLimiter } from '../configs/rate-limit.js';
import { response } from '../helpers/response.js';
import { createDurableObject } from './counter.js';
import { backup } from './routes/backup.js';
import { badge } from './routes/badge.js';
import { create } from './routes/create.js';
import { list } from './routes/list.js';
import { remove } from './routes/remove.js';
import { reset } from './routes/reset.js';
import { restore } from './routes/restore.js';
import { views } from './routes/views.js';

export const createCountty: (options?: CounttyOptions) => CounttyReturn = (
  options
) => {
  const stubName = (options || Object.create(null)).table || 'countty';

  const rateLimitOptions: CounttyOptions['rateLimit'] =
    options?.rateLimit || Object.create(null);

  const rateLimitConfig: RateLimitConfig = {
    maxRequests: rateLimitOptions?.maxRequests || 100,
    windowMs: rateLimitOptions?.windowMs || 10000,
    blockDurationMs: rateLimitOptions?.blockDurationMs || 10000,
  };

  GlobalCounttyOptions.cacheMs = options?.cacheMs;

  const Countty = createDurableObject(stubName);

  const rateLimiter = createRateLimiter(rateLimitConfig);

  const createContext = (request: Request, env: Env) => {
    const id = env.countty.idFromName(stubName);
    const stub = env.countty.get(id);
    const context = { request, env, stub };

    return {
      rateLimit: rateLimiter(request),
      router: {
        backup: (options?: RouteOptions) => backup({ ...context, ...options }),
        create: (options?: RouteOptions) => create({ ...context, ...options }),
        list: (options?: RouteOptions) => list({ ...context, ...options }),
        views: (options?: RouteOptions) => views({ ...context, ...options }),
        badge: (options?: RouteOptions) => badge({ ...context, ...options }),
        remove: (options?: RouteOptions) => remove({ ...context, ...options }),
        reset: (options?: RouteOptions) => reset({ ...context, ...options }),
        restore: (options?: RouteOptions) =>
          restore({ ...context, ...options }),
      },
    };
  };

  const Worker: ExportedHandler<Env> = {
    async fetch(request: Request, env: Env): Promise<Response> {
      const { router, rateLimit } = createContext(request, env);
      const { backup, badge, create, list, remove, reset, restore, views } =
        router;

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
          headers,
          response: {
            message: 'Request limit exceeded. Please try again later.',
          },
          status: 429,
        });

      try {
        const url = new URL(request.url);

        if (request.method === 'OPTIONS')
          return new Response(null, { status: 204, headers });

        /** Routes */
        const routes = {
          '/create': () => create({ headers }),
          '/views': () => views({ headers }),
          '/badge': () => badge({ headers }),
          '/remove': () => remove({ headers }),
          '/backup': () => backup({ headers }),
          '/restore': () => restore({ headers }),
          '/list': () => list({ headers }),
          '/reset': () => reset({ headers }),
        } as const;

        if (url.pathname in routes)
          return routes[url.pathname as keyof typeof routes]();

        return response({
          headers,
          response: { message: 'Not found.' },
          status: 404,
        });
      } catch (error) {
        console.error(error);

        return response({
          headers,
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
