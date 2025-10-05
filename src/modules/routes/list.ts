import type { RouteContext } from '../../@types.js';
import { getRouteCache, setRouteCache } from '../../configs/cache.js';
import { GlobalOptions } from '../../configs/global.js';
import { checkToken, getApi } from '../../helpers/auth.js';
import { formatNumber } from '../../helpers/format.js';
import { response } from '../../helpers/response.js';

export const list = async (context: RouteContext): Promise<Response> => {
  const { request, env, stub, headers, cacheMs } = context;

  if (request.method !== 'POST')
    return new Response('Method not allowed.', { status: 405 });

  if (!GlobalOptions.internal.rateLimit?.available)
    return response({
      headers,
      response: {
        message: 'Request limit exceeded. Please try again later.',
      },
      status: 429,
    });

  const api = getApi(request);

  if (!(await checkToken(env?.COUNTTY_TOKEN, api)))
    return response({
      headers,
      response: { message: 'Unauthorized.' },
      status: 401,
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

  const allSlugs = await stub.list();

  const formattedSlugs = allSlugs.map((item) => ({
    slug: decodeURIComponent(item.slug),
    URI: item.slug,
    views: item.views,
    label: formatNumber(item.views),
    createdAt: item.createdAt,
  }));

  const responseData = {
    total: allSlugs.length,
    slugs: formattedSlugs,
  };

  setRouteCache(request, responseData);

  return response({
    headers: {
      ...headers,
      'x-cache': 'MISS',
    },
    response: responseData,
  });
};
