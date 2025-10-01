import type { createDurableObject } from './modules/counter.js';

type Countty = InstanceType<ReturnType<typeof createDurableObject>>;

type CounttyRoutes = () => Promise<Response>;

type Router = {
  create: CounttyRoutes;
  views: CounttyRoutes;
  badge: CounttyRoutes;
  remove: CounttyRoutes;
  backup: CounttyRoutes;
  list: CounttyRoutes;
  reset: CounttyRoutes;
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

export type RouteContext = {
  request: Request;
  env: Env;
  stub: DurableObjectStub<Countty>;
  headers?: Record<string, string>;
};

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

export type CounttyOptions = {
  table?: string;
  rateLimit?: {
    maxRequests?: number;
    windowMs?: number;
    blockDurationMs?: number;
  };
};

export type CounttyReturn = {
  Worker: ExportedHandler<Env>;
  Countty: ReturnType<typeof createDurableObject>;
  createContext: (
    request: Request,
    env: Env
  ) => {
    router: Router;
    rateLimit: CounttyRateLimit;
  };
};
