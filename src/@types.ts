import type { Counter } from './modules/counter.js';

export type Env = {
  counter: DurableObjectNamespace<Counter>;
  TOKEN: string;
};
