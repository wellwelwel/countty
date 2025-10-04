import type { RouteContext } from '../../@types.js';
import { checkToken, getApi } from '../../helpers/auth.js';
import { formatNumber } from '../../helpers/format.js';
import { response } from '../../helpers/response.js';

export const list = async (context: RouteContext): Promise<Response> => {
  const { request, env, stub, headers } = context;

  if (request.method !== 'POST')
    return new Response('Method not allowed.', { status: 405 });

  const api = getApi(request);

  if (!(await checkToken(env?.COUNTTY_TOKEN, api)))
    return response({
      headers,
      response: { message: 'Unauthorized.' },
      status: 401,
    });

  const allSlugs = await stub.list();

  const formattedSlugs = allSlugs.map((item) => ({
    slug: decodeURIComponent(item.slug),
    URI: item.slug,
    views: item.views,
    label: formatNumber(item.views),
    createdAt: item.createdAt,
  }));

  return response({
    headers,
    response: {
      total: allSlugs.length,
      slugs: formattedSlugs,
    },
  });
};
