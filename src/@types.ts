import type { createDurableObject } from './modules/counter.js';

type Countty = InstanceType<ReturnType<typeof createDurableObject>>;

export type Env = {
  countty: DurableObjectNamespace<Countty>;
  COUNTTY_TOKEN?: string;
};

export type CounttyStub = DurableObjectStub<Countty>;

export type CounttyClass = ReturnType<typeof createDurableObject>;

export type RouteContext = {
  request: Request;
  env: Env;
  Countty: DurableObjectStub<Countty> | ReturnType<typeof createDurableObject>;
  headers?: Record<string, string>;
};

export type UserRouteContext = {
  request: Request;
  Countty: ReturnType<typeof createDurableObject>;
  env: Env;
  headers?: Record<string, string>;
};

export type RouteFunction = (context: RouteContext) => Promise<Response>;

export type CounttyOptions = {
  table?: string;
};
