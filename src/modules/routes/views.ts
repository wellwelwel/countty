import type { RouteContext } from '../../@types.js';
import { getRouteCache, setRouteCache } from '../../configs/cache.js';
import { GlobalOptions } from '../../configs/global.js';
import { formatNumber } from '../../helpers/format.js';
import { normalizeSlug } from '../../helpers/normalize-chars.js';
import { response } from '../../helpers/response.js';

export const views = async (context: RouteContext): Promise<Response> => {
  const { request, stub, headers, cacheMs } = context;

  if (!GlobalOptions.internal.rateLimit?.available)
    return response({
      headers,
      response: {
        message: 'Request limit exceeded. Please try again later.',
      },
      status: 429,
    });

  const url = new URL(request.url);
  const slugRaw = url.searchParams.get('slug');

  if (typeof slugRaw !== 'string' || !slugRaw) {
    return response({
      headers,
      response: { message: 'Slug parameter is required [1].' },
      status: 400,
    });
  }

  if (typeof slugRaw !== 'string')
    return response({
      headers,
      response: { message: 'Slug parameter is required [1].' },
      status: 400,
    });

  const slug = normalizeSlug(slugRaw);
  if (slug.length === 0)
    return response({
      headers,
      response: { message: 'Slug parameter is required [2].' },
      status: 400,
    });

  const cache = cacheMs ?? GlobalOptions.user?.cacheMs;
  const cached =
    typeof cache === 'number' && cache > 0
      ? getRouteCache(request, cache)
      : undefined;

  if (cached?.hit) {
    return response({
      headers: {
        ...headers,
        'x-cache': 'HIT',
      },
      response: cached.data,
    });
  }

  const views = await stub.increment(slug);
  const label = formatNumber(views);
  const responseData = { views, label };

  setRouteCache(request, responseData);

  return response({
    headers: {
      ...headers,
      'x-cache': 'MISS',
    },
    response: responseData,
  });
};
