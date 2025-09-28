/// <reference types="@cloudflare/workers-types" />

import type { Env } from '../@types.js';
import { DurableObject } from 'cloudflare:workers';

export class Counter extends DurableObject<Env> {
  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
  }

  async get(key: string): Promise<number> {
    return (await this.ctx.storage.get(key)) || 0;
  }

  async set(key: string, value: number): Promise<void> {
    await this.ctx.storage.put(key, value);
  }
}
