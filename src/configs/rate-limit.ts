import type { RateLimitConfig } from '../@types.js';
import { hash } from '../helpers/hash.js';
import { cache } from './cache.js';

export const getRateLimitKey = async (request: Request): Promise<string> => {
  const ip =
    request.headers.get('CF-Connecting-IP') ||
    request.headers.get('X-Forwarded-For') ||
    'UNKNOWN';

  return await hash(ip.slice(0, 19));
};

export const checkRateLimit = async (
  request: Request,
  config: RateLimitConfig
): Promise<{
  available: boolean;
  remaining: number;
  resetAt?: number;
}> => {
  const maxRequests = config.maxRequests;
  const windowMs = config.windowMs;
  const blockDurationMs = config.blockDurationMs;

  const now = Date.now();
  const key = await getRateLimitKey(request);
  const data = cache.rateLimit.get(key);

  if (data?.blocked && now < data.resetAt!)
    return { available: false, remaining: 0, resetAt: data.resetAt };

  if (!data || now - data.timestamp >= windowMs) {
    cache.rateLimit.set(key, {
      count: 1,
      timestamp: now,
      blocked: false,
    });
    return { available: true, remaining: maxRequests - 1 };
  }

  const count = data.count + 1;

  if (count > maxRequests) {
    const resetAt = now + blockDurationMs;

    cache.rateLimit.set(key, {
      count,
      timestamp: data.timestamp,
      blocked: true,
      resetAt,
    });

    return { available: false, remaining: 0, resetAt };
  }

  cache.rateLimit.set(key, {
    ...data,
    count,
  });

  return {
    available: true,
    remaining: maxRequests - count,
  };
};

export const createRateLimiter =
  (config: RateLimitConfig) => (request: Request) =>
    checkRateLimit(request, config);
