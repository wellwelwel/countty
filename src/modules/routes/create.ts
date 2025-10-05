import type { RouteContext } from '../../@types.js';
import { GlobalOptions } from '../../configs/global.js';
import { checkToken, getApi } from '../../helpers/auth.js';
import { normalizeSlug } from '../../helpers/normalize-chars.js';
import { response } from '../../helpers/response.js';

export const create = async (context: RouteContext): Promise<Response> => {
  const { request, env, stub, headers: userHeaders } = context;

  const headers = Object.freeze({
    ...GlobalOptions.internal.headers,
    ...userHeaders,
    'X-RateLimit-Remaining': String(
      GlobalOptions.internal.rateLimit?.remaining
    ),
  });

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
