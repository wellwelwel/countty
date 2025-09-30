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

const { Countty, routes } = createCountty();

const Worker: ExportedHandler<Env> = {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const context = { request, env, Countty };
    const { pathname } = url;

    const notFound = new Response(JSON.stringify({ message: 'Not found.' }), {
      status: 404,
    });

    const routeHandlers: CounttyRoutes = {
      '/create': routes.create,
      '/views': routes.views,
      '/remove': routes.remove,
      '/backup': routes.backup,
      '/reset': routes.reset,
    };

    return routeHandlers[pathname](context) || notFound;
  },
};

// Durable Object (SQLite)
export { Countty };

// Worker App
export default Worker;
`;
