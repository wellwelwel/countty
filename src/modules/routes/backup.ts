import type { RouteContext } from '../worker.js';
import { checkToken, getApi } from '../../helpers/auth.js';
import { response } from '../../helpers/response.js';

export const backup = async (context: RouteContext): Promise<Response> => {
  const { request, env, Countty, headers } = context;
  const { filename, dump } = await Countty.backup();
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
