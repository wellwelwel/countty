import type { RouteContext } from '../../@types.js';
import { GlobalOptions } from '../../configs/global.js';
import { checkToken, getApi } from '../../helpers/auth.js';
import { response } from '../../helpers/response.js';

export const backup = async (context: RouteContext): Promise<Response> => {
  const { request, env, stub, headers } = context;

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

  const { filename, dump } = await stub.backup();
  const api = getApi(request);

  if (!(await checkToken(env?.COUNTTY_TOKEN, api)))
    return response({
      headers,
      response: { message: 'Unauthorized.' },
      status: 401,
    });

  return new Response(new TextDecoder().decode(dump), {
    status: 200,
    headers: {
      ...headers,
      'Content-Type': 'application/sql; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
};
