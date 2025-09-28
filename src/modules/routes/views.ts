/// <reference types="@cloudflare/workers-types" />

import type { RouteContext } from '../worker.js';
import { normalizeChars } from '../../helpers/normalize-chars.js';

export const views = async (context: RouteContext): Promise<Response> => {
  const { request, stub, response } = context;

  const rawBody = await request.text();
  const { slug: slugRaw } = JSON.parse(rawBody);

  if (typeof slugRaw !== 'string')
    return response({ message: 'Slug parameter is required [1].' }, 400);

  const slug = normalizeChars(slugRaw);
  if (slug.length === 0)
    return response({ message: 'Slug parameter is required [2].' }, 400);

  const currentViews = await stub.get(slug);
  const views = currentViews + 1;

  await stub.set(slug, views);

  return response({ views });
};
