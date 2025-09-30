export const workerPlugin = `/// <reference types="@cloudflare/workers-types" />

import { createCountty, type Env } from 'countty';

const { Countty, createContext } = createCountty();

const Worker: ExportedHandler<Env> = {
  async fetch(request: Request, env: Env): Promise<Response> {
    const { router, rateLimit } = createContext(request, env);

    const customRoute: Record<string, () => Promise<Response>> = {
      '/create': router.create,
      '/views': router.views,
      '/remove': router.remove,
      '/backup': router.backup,
      '/reset': router.reset,
    };

    const url = new URL(request.url);
    const { pathname } = url;

    // Countty Routes
    if (pathname in customRoute) {
      if (!rateLimit.available)
        return new Response(
          JSON.stringify({
            message: 'Request limit exceeded. Please try again later.',
          }),
          { status: 429 }
        );

      return customRoute[pathname]();
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

export const workerStandalone = `import { createCountty } from 'countty';

const { Worker, Countty } = createCountty();

// Worker App
export default Worker;

// Durable Object (SQLite)
export { Countty };
`;
