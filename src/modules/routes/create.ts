import type { RouteContext } from '../worker.js';
import { checkToken, getApi } from '../../helpers/auth.js';
import { normalizeChars } from '../../helpers/normalize-chars.js';

export const create = async (context: RouteContext): Promise<Response> => {
  const { request, env, stub, response } = context;
  const api = getApi(request);

  if (!(await checkToken(env.TOKEN, api)))
    return response({ message: 'Unauthorized.' }, 401);

  const url = new URL(request.url);
  const slugRaw = url.searchParams.get('slug');

  if (typeof slugRaw !== 'string' || !slugRaw) {
    return response({ message: 'Slug parameter is required [1].' }, 400);
  }

  const slug = normalizeChars(slugRaw);
  if (slug.length === 0)
    return response({ message: 'Slug parameter is required [2].' }, 400);

  if (await stub.exists(slug))
    return response({ message: 'Slug already exists.' }, 200);

  await stub.create(slug);

  return response({
    message: 'Slug created successfully.',
  });
};
