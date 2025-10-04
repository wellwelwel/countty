import type { RouteContext } from '../../@types.js';
import { checkToken, getApi } from '../../helpers/auth.js';
import { response } from '../../helpers/response.js';

export const reset = async (context: RouteContext): Promise<Response> => {
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

  const reseted = await stub.reset();

  if (!reseted)
    return response({
      headers,
      response: { message: `Countty wasn't reseted.` },
      status: 500,
    });

  return response({
    headers,
    response: { message: `Countty was reseted successfully.` },
    status: 200,
  });
};
