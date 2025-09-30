import type { RouteContext } from '../../@types.js';
import { checkToken, getApi } from '../../helpers/auth.js';
import { response } from '../../helpers/response.js';
import { resolveStub } from '../../helpers/stub.js';

export const reset = async (context: RouteContext): Promise<Response> => {
  const { request, env, Countty } = context;
  const counttyStub = resolveStub(Countty, env);

  if (request.method !== 'POST')
    return new Response('Method not allowed.', { status: 405 });

  const api = getApi(request);

  if (!(await checkToken(env?.COUNTTY_TOKEN, api)))
    return response({ response: { message: 'Unauthorized.' }, status: 401 });

  const reseted = await counttyStub.reset();

  if (!reseted)
    return response({
      response: { message: `Countty wasn't reseted.` },
      status: 500,
    });

  return response({
    response: { message: `Countty was reseted successfully.` },
    status: 200,
  });
};
