import type {
  CounttyOptions,
  Env,
  RateLimitConfig,
  RouteContext,
  RouteFunction,
} from '../@types.js';
import { createRateLimiter } from '../configs/rate-limit.js';
import { response } from '../helpers/response.js';
import { createDurableObject } from './counter.js';
import { backup } from './routes/backup.js';
import { create } from './routes/create.js';
import { remove } from './routes/remove.js';
import { reset } from './routes/reset.js';
import { views } from './routes/views.js';

export const createCountty: (options?: CounttyOptions) => {
  Worker: ExportedHandler<Env>;
  Countty: ReturnType<typeof createDurableObject>;
  routes: {
    backup: RouteFunction;
    create: RouteFunction;
    views: RouteFunction;
    remove: RouteFunction;
    reset: RouteFunction;
  };
  rateLimiter: (request: Request) => {
    available: boolean;
    remaining: number;
    resetAt?: number;
  };
} = (options) => {
  const stubName = (options || Object.create(null)).table || 'countty';
  const rateLimitOptions: CounttyOptions['rateLimit'] =
    options?.rateLimit || Object.create(null);

  const rateLimitConfig: RateLimitConfig = {
    maxRequests: rateLimitOptions?.maxRequests || 20,
    windowMs: rateLimitOptions?.windowMs || 10000,
    blockDurationMs: rateLimitOptions?.blockDurationMs || 10000,
  };

  const rateLimiter = createRateLimiter(rateLimitConfig);

  return {
    Worker: {
      async fetch(request: Request, env: Env): Promise<Response> {
        const rateLimit = rateLimiter(request);

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
          const id = env.countty.idFromName(stubName);
          const stub = env.countty.get(id);
          const routeContext: RouteContext = {
            request,
            env,
            Countty: stub,
            headers,
          };

          if (request.method === 'OPTIONS')
            return new Response(null, { status: 204, headers });

          /** Routes */
          switch (url.pathname) {
            case '/create':
              return create(routeContext);
            case '/views':
              return views(routeContext);
            case '/remove':
              return remove(routeContext);
            case '/backup':
              return backup(routeContext);
            case '/reset':
              return reset(routeContext);
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
    },
    Countty: createDurableObject(stubName),
    routes: {
      backup,
      create,
      remove,
      views,
      reset,
    },
    rateLimiter,
  };
};
