import type { RateLimitData, RouteCacheData } from '../@types.js';
import { createLRU } from 'lru.min';
import { getRateLimitKey } from './rate-limit.js';

export const cache = {
  rateLimit: createLRU<string, RateLimitData>({ max: 1000 }),
  route: createLRU<string, RouteCacheData>({ max: 1000 }),
};

const getRouteCacheKey = async (request: Request): Promise<string> => {
  const ip = await getRateLimitKey(request);
  const url = new URL(request.url);
  const searchParams = new URLSearchParams(url.search);

  return `${ip}${url.pathname}?${String(searchParams)}`;
};

export const getRouteCache = async (
  request: Request,
  ttl: number = 1000
): Promise<{
  hit: boolean;
  data?: any;
}> => {
  const now = Date.now();
  const key = await getRouteCacheKey(request);
  const cached = cache.route.get(key);

  if (!cached || now - cached.timestamp >= ttl) return { hit: false };

  return { hit: true, data: cached.data };
};

export const setRouteCache = async (
  request: Request,
  data: any
): Promise<void> => {
  const key = await getRouteCacheKey(request);

  cache.route.set(key, {
    data,
    timestamp: Date.now(),
  });
};
