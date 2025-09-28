import type { Env } from '../@types.js';
import type { Counter } from './counter.js';
import { createDurableObject } from './counter.js';
export type RouteContext = {
    request: Request;
    env: Env;
    stub: DurableObjectStub<Counter>;
    headers: Record<string, string>;
    response: (response: unknown, status?: number) => Response;
};
export declare const createCountty: (stubName?: string) => {
    worker: ExportedHandler<Env>;
    Counter: ReturnType<typeof createDurableObject>;
};
