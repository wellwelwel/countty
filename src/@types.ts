import type { Countty } from './modules/counter.js';

export type Env = {
  counter: DurableObjectNamespace<Countty>;
  TOKEN: string;
};
