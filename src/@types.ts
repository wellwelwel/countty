import type { Counter } from './modules/counter.js';

export type Env = {
  ENVIRONMENT: 'production' | 'development';
  counter: DurableObjectNamespace<Counter>;
};
