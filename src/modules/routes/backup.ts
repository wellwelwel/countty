/// <reference types="@cloudflare/workers-types" />

import type { RouteContext } from '../worker.js';

export const backup = async (context: RouteContext): Promise<Response> => {
  const { stub, headers } = context;

  const { filename, dump } = await stub.backup();

  return new Response(new TextDecoder().decode(dump), {
    status: 200,
    headers: {
      ...headers,
      'Content-Type': 'application/sql; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
};
