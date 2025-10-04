import type { RouteContext } from '../../@types.js';
import { formatNumber } from '../../helpers/format.js';
import { normalizeSlug } from '../../helpers/normalize-chars.js';
import { response } from '../../helpers/response.js';

export const views = async (context: RouteContext): Promise<Response> => {
  const { request, stub, headers } = context;

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

  const views = await stub.increment(slug);
  const label = formatNumber(views);

  return response({ headers, response: { views, label } });
};
