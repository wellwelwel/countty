import type { RouteContext } from '../../@types.js';
import { GlobalOptions } from '../../configs/global.js';
import { checkToken, getApi } from '../../helpers/auth.js';
import { response } from '../../helpers/response.js';

export const reset = async (context: RouteContext): Promise<Response> => {
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
