import type { RouteContext } from '../worker.js';
import { normalizeChars } from '../../helpers/normalize-chars.js';

export const views = async (context: RouteContext): Promise<Response> => {
  const { request, stub, response } = context;
  const rawBody = await request.text();
  const { slug: slugRaw } = JSON.parse(rawBody);

  if (typeof slugRaw !== 'string')
    return response({ message: 'Slug parameter is required [1].' }, 400);

  const slug = normalizeChars(slugRaw);
  if (slug.length === 0)
    return response({ message: 'Slug parameter is required [2].' }, 400);

  const views = await stub.increment(slug);

  return response({ views });
};
