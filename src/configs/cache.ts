import type { RateLimitData } from '../@types.js';
import { createLRU } from 'lru.min';

export const cache = {
  rateLimit: createLRU<string, RateLimitData>({ max: 1000 }),
};
