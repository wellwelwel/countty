/// <reference types="@cloudflare/workers-types" />

import { backup, create, views } from './modules/routes.js';
import { createCountty } from './modules/worker.js';

const routes = { backup, create, views };

export { createCountty, routes };
