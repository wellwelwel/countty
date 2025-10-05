export const workerPlugin = `import { createCountty, type CounttyRouter, type Env } from 'countty';

const { Countty, createContext } = createCountty();

const Worker: ExportedHandler<Env> = {
  async fetch(request: Request, env: Env): Promise<Response> {
    const { router } = createContext(request, env);

    // Countty Routes
    const customRoute: CounttyRouter = {
      '/create': router.create,
      '/views': router.views,
      '/badge': router.badge,
      '/remove': router.remove,
      '/backup': router.backup,
      '/list': router.list,
      '/reset': router.reset,
      '/restore': router.restore,
    };

    const url = new URL(request.url);
    const { pathname } = url;

    if (pathname in customRoute) return customRoute[pathname]();

    // Your routes
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
