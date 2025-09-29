import type { RouteContext } from '../worker.js';
import { normalizeChars } from '../../helpers/normalize-chars.js';
import { response } from '../../helpers/response.js';

export const views = async (context: RouteContext): Promise<Response> => {
  const { request, Countty } = context;

  const url = new URL(request.url);
  const slugRaw = url.searchParams.get('slug');

  if (typeof slugRaw !== 'string' || !slugRaw) {
    return response({
      response: { message: 'Slug parameter is required [1].' },
      status: 400,
    });
  }

  if (typeof slugRaw !== 'string')
    return response({
      response: { message: 'Slug parameter is required [1].' },
      status: 400,
    });

  const slug = normalizeChars(slugRaw);
  if (slug.length === 0)
    return response({
      response: { message: 'Slug parameter is required [2].' },
      status: 400,
    });

  const views = await Countty.increment(slug);

  return response({ response: { views } });
};
