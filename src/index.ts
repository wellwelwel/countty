/// <reference types="@cloudflare/workers-types" />

import { worker } from './modules/worker.js';

export { Counter } from './modules/counter.js';
export default worker;
