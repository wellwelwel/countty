import type { RateLimitData, RouteCacheData } from '../@types.js';
import { createLRU } from 'lru.min';

export const cache = {
  rateLimit: createLRU<string, RateLimitData>({ max: 1000 }),
  route: createLRU<string, RouteCacheData>({ max: 1000 }),
};

const getRouteCacheKey = (request: Request): string => {
  const url = new URL(request.url);
  const searchParams = new URLSearchParams(url.search);

  searchParams.delete('Authorization');

  return `${url.pathname}?${String(searchParams)}`;
};

export const getRouteCache = (
  request: Request,
  ttl: number = 1000
): {
  hit: boolean;
  data?: any;
} => {
  const now = Date.now();
  const key = getRouteCacheKey(request);
  const cached = cache.route.get(key);

  if (!cached || now - cached.timestamp >= ttl) return { hit: false };

  return { hit: true, data: cached.data };
};

export const setRouteCache = (request: Request, data: any): void => {
  const key = getRouteCacheKey(request);

  cache.route.set(key, {
    data,
    timestamp: Date.now(),
  });
};
