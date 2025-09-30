import type { RouteContext } from '../../@types.js';
import { checkToken, getApi } from '../../helpers/auth.js';
import { normalizeSlug } from '../../helpers/normalize-chars.js';
import { response } from '../../helpers/response.js';
import { resolveStub } from '../../helpers/stub.js';

export const remove = async (context: RouteContext): Promise<Response> => {
  const { request, env, Countty } = context;
  const counttyStub = resolveStub(Countty, env);

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

  const slug = normalizeSlug(slugRaw);
  if (slug.length === 0)
    return response({
      response: { message: 'Slug parameter is required [2].' },
      status: 400,
    });

  const deleted = await counttyStub.delete(slug);

  if (!deleted)
    return response({
      response: { message: `Slug '${slug}' not found.` },
      status: 404,
    });

  return response({
    response: { message: `Slug '${slug}' deleted successfully.` },
    status: 200,
  });
};
