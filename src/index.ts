/// <reference types="@cloudflare/workers-types" />

import { createWorker } from './modules/worker.js';

export { Counter } from './modules/counter.js';

export const worker = createWorker('countty');
