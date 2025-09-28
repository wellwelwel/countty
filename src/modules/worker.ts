/// <reference types="@cloudflare/workers-types" />

import type { Env } from '../@types.js';
import type { Counter } from './counter.js';
import { ALLOWED_ORIGINS } from '../configs/origins.js';
import { checkRateLimit, RATE_LIMIT } from '../configs/rate-limit.js';
import { backup, views } from './routes.js';

export type RouteContext = {
  request: Request;
  env: Env;
  stub: DurableObjectStub<Counter>;
  headers: Record<string, string>;
  response: (response: unknown, status?: number) => Response;
};

export const worker: ExportedHandler<Env> = {
  async fetch(request: Request, env: Env): Promise<Response> {
    const stubName = 'global-counter';
    const rateLimit = checkRateLimit(request);
    const isProduction = env.ENVIRONMENT === 'production';
    const useOrigin = ALLOWED_ORIGINS.size > 0 && isProduction;
    const origin = useOrigin ? request.headers.get('Origin') : null;

    if (
      useOrigin &&
      (!origin || typeof origin !== 'string' || !ALLOWED_ORIGINS.has(origin))
    )
      return new Response('Method not allowed.', { status: 405 });

    const headers = Object.freeze({
      'Access-Control-Allow-Origin': useOrigin ? String(origin) : '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Content-Type': 'application/json; charset=utf-8',
      'X-RateLimit-Limit': String(RATE_LIMIT.MAX_REQUESTS),
      'X-RateLimit-Remaining': String(rateLimit.remaining),
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

      /** Routes */
      switch (url.pathname) {
        case '/views':
          return await views(routeContext);
        case '/backup':
          return await backup(routeContext);
        default:
          return response({ message: 'Not found.' }, 404);
      }
    } catch (error) {
      if (!isProduction) console.error(error);

      return response({ message: 'Oops! Internal error.' }, 500);
    }
  },
};
