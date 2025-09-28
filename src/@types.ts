import type { Countty } from './modules/counter.js';

export type Env = {
  countty: DurableObjectNamespace<Countty>;
  TOKEN: string;
};
