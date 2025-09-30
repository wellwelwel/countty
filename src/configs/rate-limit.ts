import type { RateLimitConfig } from '../@types.js';
import { cache } from './cache.js';

const getRateLimitKey = (request: Request): string => {
  const ip =
    request.headers.get('CF-Connecting-IP') ||
    request.headers.get('X-Forwarded-For') ||
    'UNKNOWN';

  return String(ip).slice(0, 19);
};

export const checkRateLimit = (
  request: Request,
  config: RateLimitConfig
): {
  available: boolean;
  remaining: number;
  resetAt?: number;
} => {
  const maxRequests = config.maxRequests;
  const windowMs = config.windowMs;
  const blockDurationMs = config.blockDurationMs;

  const now = Date.now();
  const key = getRateLimitKey(request);
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
