import type { RouteContext } from '../worker.js';
import { checkToken, getApi } from '../../helpers/auth.js';
import { normalizeChars } from '../../helpers/normalize-chars.js';
import { response } from '../../helpers/response.js';

export const create = async (context: RouteContext): Promise<Response> => {
  const { request, env, Countty } = context;

  if (request.method !== 'POST')
    return new Response('Method not allowed.', { status: 405 });

  const api = getApi(request);

  if (!(await checkToken(env?.TOKEN, api)))
    return response({ response: { message: 'Unauthorized.' }, status: 401 });

  const rawBody = await request.text();
  const { slug: slugRaw } = JSON.parse(rawBody);

  if (typeof slugRaw !== 'string' || !slugRaw) {
    return response({
      response: { message: 'Slug parameter is required [1].' },
      status: 400,
    });
  }

  const slug = normalizeChars(slugRaw);
  if (slug.length === 0)
    return response({
      response: { message: 'Slug parameter is required [2].' },
      status: 400,
    });

  if (await Countty.exists(slug))
    return response({ response: { message: 'Slug already exists.' } });

  await Countty.create(slug);

  return response({ response: { message: 'Slug created successfully.' } });
};
