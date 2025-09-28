/// <reference types="@cloudflare/workers-types" />

import type { Env } from '../@types.js';
import { ALLOWED_ORIGINS } from '../configs/origins.js';
import { checkRateLimit, RATE_LIMIT } from '../configs/rate-limit.js';
import { normalizeChars } from '../helpers/normalize-chars.js';

export const worker: ExportedHandler<Env> = {
  async fetch(request: Request, env: Env): Promise<Response> {
    const rateLimit = checkRateLimit(request);
    const origin = request.headers.get('Origin');
    const isProduction = env.ENVIRONMENT === 'production';

    if (
      isProduction &&
      (!origin || typeof origin !== 'string' || !ALLOWED_ORIGINS.has(origin))
    )
      return new Response('Method not allowed [2].', { status: 405 });

    const headers = Object.freeze({
      'Access-Control-Allow-Origin': isProduction ? String(origin) : '*',
      'Access-Control-Allow-Methods': 'POST',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Content-Type': 'application/json; charset=utf-8',
      'X-RateLimit-Limit': String(RATE_LIMIT.MAX_REQUESTS),
      'X-RateLimit-Remaining': String(rateLimit.remaining),
    });

    const response = (response: unknown, status = 200) =>
      new Response(JSON.stringify(response), { status, headers });

    try {
      if (!rateLimit.available)
        return response(
          {
            message: 'Request limit exceeded. Please try again later.',
          },
          429
        );

      const url = new URL(request.url);
      const id = env.counter.idFromName('global-counter');
      const instance = env.counter.get(id);

      if (url.pathname === '/views') {
        const rawBody = await request.text();
        const { slug: slugRaw } = JSON.parse(rawBody);

        if (typeof slugRaw !== 'string')
          return response({ message: 'Slug parameter is required [1].' }, 400);

        const slug = normalizeChars(slugRaw);
        if (slug.length === 0)
          return response({ message: 'Slug parameter is required [2].' }, 400);

        const currentViews = await instance.get(slug);
        const views = currentViews + 1;

        await instance.set(slug, views);

        return response({ views });
      }

      if (url.pathname === '/backup') {
        const { filename, dump } = await instance.backup();

        return new Response(new TextDecoder().decode(dump), {
          status: 200,
          headers: {
            ...headers,
            'Content-Type': 'application/sql; charset=utf-8',
            'Content-Disposition': `attachment; filename="${filename}"`,
          },
        });
      }

      return response({ message: 'Not found.' }, 404);
    } catch (error) {
      if (!isProduction) console.error(error);

      return response({ message: 'Oops! Internal error.' }, 500);
    }
  },
};
