import type { createDurableObject } from './modules/counter.js';

type Countty = InstanceType<ReturnType<typeof createDurableObject>>;

type CounttyRoutes = (options?: RouteOptions) => Promise<Response>;

type Router = {
  create: CounttyRoutes;
  views: CounttyRoutes;
  badge: CounttyRoutes;
  remove: CounttyRoutes;
  backup: CounttyRoutes;
  list: CounttyRoutes;
  reset: CounttyRoutes;
  restore: CounttyRoutes;
};

type CounttyRateLimit = {
  available: boolean;
  remaining: number;
  resetAt?: number;
};

export type Env = {
  countty: DurableObjectNamespace<Countty>;
  COUNTTY_TOKEN?: string;
};

export type RouteOptions = {
  headers?: Record<string, string>;
  cacheMs?: number;
};

export type RouteContext = {
  request: Request;
  env: Env;
  stub: DurableObjectStub<Countty>;
} & RouteOptions;

export type RateLimitData = {
  count: number;
  timestamp: number;
  blocked: boolean;
  resetAt?: number;
};

export type RateLimitConfig = {
  maxRequests: number;
  windowMs: number;
  blockDurationMs: number;
};

export type RouteCacheData = {
  data: any;
  timestamp: number;
};

export type GlobalCounttyOptions = Readonly<{
  user: CounttyOptions;
  internal: Partial<{
    rateLimit: CounttyRateLimit;
    headers: Record<string, string>;
  }>;
}>;

export type CounttyOptions = {
  table?: string;
  rateLimit?: {
    maxRequests?: number;
    windowMs?: number;
    blockDurationMs?: number;
  };
  cacheMs?: number;
};

export type CounttyRouter = Record<string, CounttyRoutes>;

export type CounttyReturn = {
  Worker: ExportedHandler<Env>;
  Countty: ReturnType<typeof createDurableObject>;
  createContext: (
    request: Request,
    env: Env
  ) => Promise<{
    router: Router;
  }>;
};
