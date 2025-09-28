import { createLRU } from 'lru.min';
import { RateLimitData } from './rate-limit.js';

export const cache = {
  rateLimit: createLRU<string, RateLimitData>({ max: 1000 }),
};
