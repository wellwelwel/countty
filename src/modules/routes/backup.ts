import type { RouteContext } from 'src/@types.js';
import { checkToken, getApi } from '../../helpers/auth.js';
import { response } from '../../helpers/response.js';
import { resolveStub } from '../../helpers/stub.js';

export const backup = async (context: RouteContext): Promise<Response> => {
  const { request, env, Countty, headers } = context;
  const counttyStub = resolveStub(Countty, env);
  const { filename, dump } = await counttyStub.backup();
  const api = getApi(request);

  if (!(await checkToken(env?.TOKEN, api)))
    return response({ response: { message: 'Unauthorized.' }, status: 401 });

  return new Response(new TextDecoder().decode(dump), {
    status: 200,
    headers: {
      ...headers,
      'Content-Type': 'application/sql; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
};
