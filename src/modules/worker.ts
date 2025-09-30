import type {
  CounttyOptions,
  Env,
  RouteContext,
  RouteFunction,
} from '../@types.js';
import { checkRateLimit, RATE_LIMIT } from '../configs/rate-limit.js';
import { response } from '../helpers/response.js';
import { createDurableObject } from './counter.js';
import { backup, create, remove, reset, views } from './routes.js';

export const createCountty: (options?: CounttyOptions) => {
  Worker: ExportedHandler<Env>;
  Countty: ReturnType<typeof createDurableObject>;
  routes: {
    backup: RouteFunction;
    create: RouteFunction;
    views: RouteFunction;
    remove: RouteFunction;
  };
} = (options) => {
  const stubName = (options || Object.create(null)).table || 'countty';

  return {
    Worker: {
      async fetch(request: Request, env: Env): Promise<Response> {
        const rateLimit = checkRateLimit(request);

        const headers = Object.freeze({
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Max-Age': '1800',
          'Content-Type': 'application/json; charset=utf-8',
          'X-RateLimit-Limit': String(RATE_LIMIT.MAX_REQUESTS),
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
          if (url.pathname.startsWith('/delete')) {
            return remove(routeContext);
          }

          switch (url.pathname) {
            case '/views':
              return views(routeContext);
            case '/create':
              return create(routeContext);
            case '/backup':
              return backup(routeContext);
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
  };
};
