export const workerPlugin = `import type { CounttyRouter, Env } from 'countty';
import { createCountty } from 'countty';

const { Countty, createContext } = createCountty();

const Worker: ExportedHandler<Env> = {
  async fetch(request: Request, env: Env): Promise<Response> {
    const { router, rateLimit } = createContext(request, env);

    const customRoute: CounttyRouter = {
      '/create': router.create,
      '/views': router.views,
      '/badge': router.badge,
      '/remove': router.remove,
      '/backup': router.backup,
      '/list': router.list,
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
