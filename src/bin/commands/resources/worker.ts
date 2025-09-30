export const worker = `/// <reference types="@cloudflare/workers-types" />

import { createCountty, type Env } from 'countty';

type CounttyRoutes = Record<
  string,
  (ctx: {
    request: Request;
    env: Env;
    Countty: typeof Countty;
  }) => Promise<Response>
>;

const { Countty, routes, rateLimiter } = createCountty();

const Worker: ExportedHandler<Env> = {
  async fetch(request: Request, env: Env): Promise<Response> {
    const context = { request, env, Countty };
    const rateLimit = rateLimiter(request);
    const url = new URL(request.url);
    const { pathname } = url;

    const routeHandlers: CounttyRoutes = {
      '/create': routes.create,
      '/views': routes.views,
      '/remove': routes.remove,
      '/backup': routes.backup,
      '/reset': routes.reset,
    };

    // Countty Routes
    if (pathname in routeHandlers) {
      if (!rateLimit.available)
        return new Response(
          JSON.stringify({
            message: 'Request limit exceeded. Please try again later.',
          }),
          { status: 429 }
        );

      return routeHandlers[pathname](context);
    }

    return new Response(JSON.stringify({ message: 'Not found.' }), {
      status: 404,
    });
  },
};

// Durable Object (SQLite)
export { Countty };

// Worker App
export default Worker;
`;
