import type { RouteContext } from '../../@types.js';
import { GlobalOptions } from '../../configs/global.js';
import { checkToken, getApi } from '../../helpers/auth.js';
import { response } from '../../helpers/response.js';

/** Experimental Route. */
export const restore = async (context: RouteContext): Promise<Response> => {
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

  const sqlContent = await request.text();

  if (!sqlContent || sqlContent.trim() === '')
    return response({
      headers,
      response: { message: 'No SQL content provided.' },
      status: 400,
    });

  const result = await stub.restore(sqlContent);
  const isSuccess = result.message.includes('successfully');

  return response({
    headers,
    response: { message: result.message },
    status: isSuccess ? 200 : 400,
  });
};
