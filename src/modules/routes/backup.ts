import type { RouteContext } from '../worker.js';
import { checkToken, getApi } from 'src/helpers/auth.js';

export const backup = async (context: RouteContext): Promise<Response> => {
  const { request, env, stub, response, headers } = context;
  const { filename, dump } = await stub.backup();
  const api = getApi(request);

  if (!(await checkToken(env.TOKEN, api)))
    return response({ message: 'Unauthorized.' }, 401);

  return new Response(new TextDecoder().decode(dump), {
    status: 200,
    headers: {
      ...headers,
      'Content-Type': 'application/sql; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
};
