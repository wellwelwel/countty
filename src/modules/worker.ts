import type { Env } from '../@types.js';
import type { Counter } from './counter.js';
import { checkRateLimit, RATE_LIMIT } from '../configs/rate-limit.js';
import { backup, create, views } from './routes.js';

export type RouteContext = {
  request: Request;
  env: Env;
  stub: DurableObjectStub<Counter>;
  headers: Record<string, string>;
  response: (response: unknown, status?: number) => Response;
};

export const createWorker: (stubName?: string) => ExportedHandler<Env> = (
  stubName = 'countty'
) => ({
  async fetch(request: Request, env: Env): Promise<Response> {
    const rateLimit = checkRateLimit(request);
    const isProduction = env.ENVIRONMENT === 'production';

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

    const response = (response: unknown, status = 200) =>
      new Response(JSON.stringify(response), { status, headers });

    if (!rateLimit.available)
      return response(
        { message: 'Request limit exceeded. Please try again later.' },
        429
      );

    try {
      const url = new URL(request.url);
      const id = env.counter.idFromName(stubName);
      const stub = env.counter.get(id);
      const routeContext: RouteContext = {
        request,
        env,
        stub,
        headers,
        response,
      };

      if (request.method === 'OPTIONS')
        return new Response(null, { status: 204, headers });

      /** Routes */
      switch (url.pathname) {
        case '/views':
          return views(routeContext);
        case '/create':
          return create(routeContext);
        case '/backup':
          return backup(routeContext);
        default:
          return response({ message: 'Not found.' }, 404);
      }
    } catch (error) {
      if (!isProduction) console.error(error);

      return response({ message: 'Oops! Internal error.' }, 500);
    }
  },
});
