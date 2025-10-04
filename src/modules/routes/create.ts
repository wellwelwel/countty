import type { RouteContext } from '../../@types.js';
import { checkToken, getApi } from '../../helpers/auth.js';
import { normalizeSlug } from '../../helpers/normalize-chars.js';
import { response } from '../../helpers/response.js';

export const create = async (context: RouteContext): Promise<Response> => {
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

  const rawBody = await request.text();
  const { slug: slugRaw } = JSON.parse(rawBody);

  if (typeof slugRaw !== 'string' || !slugRaw) {
    return response({
      headers,
      response: { message: 'Slug parameter is required [1].' },
      status: 400,
    });
  }

  const slug = normalizeSlug(slugRaw);
  if (slug.length === 0)
    return response({
      headers,
      response: { message: 'Slug parameter is required [2].' },
      status: 400,
    });

  if (await stub.exists(slug))
    return response({ headers, response: { message: 'Slug already exists.' } });

  await stub.create(slug);

  return response({
    headers,
    response: { message: 'Slug created successfully.' },
  });
};
