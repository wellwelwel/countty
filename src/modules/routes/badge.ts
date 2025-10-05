import type { Format } from 'badge-maker';
import type { RouteContext } from '../../@types.js';
import { makeBadge } from 'badge-maker';
import { getRouteCache, setRouteCache } from '../../configs/cache.js';
import { GlobalOptions } from '../../configs/global.js';
import { formatNumber } from '../../helpers/format.js';
import { normalizeSlug } from '../../helpers/normalize-chars.js';
import { response } from '../../helpers/response.js';

const normalizeHexColor = (color?: string): string | undefined => {
  if (!color) return undefined;

  return `#${color.replace(/#|[^a-f0-9]/g, '').substring(0, 6)}`;
};

export const badge = async (context: RouteContext): Promise<Response> => {
  const { request, stub, headers, cacheMs } = context;

  if (!GlobalOptions.internal.rateLimit?.available)
    return response({
      headers,
      response: {
        message: 'Request limit exceeded. Please try again later.',
      },
      status: 429,
    });

  const url = new URL(request.url);
  const slugRaw = url.searchParams.get('slug');

  if (typeof slugRaw !== 'string' || !slugRaw) {
    return response({
      response: { message: 'Slug parameter is required [1].' },
      status: 400,
    });
  }

  if (typeof slugRaw !== 'string')
    return response({
      headers,
      response: { message: 'Slug parameter is required [1].' },
      status: 400,
    });

  const slug = normalizeSlug(slugRaw);
  if (slug.length === 0)
    return response({
      headers,
      response: { message: 'Slug parameter is required [2].' },
      status: 400,
    });

  const cache = cacheMs ?? GlobalOptions.user?.cacheMs;
  const cached =
    typeof cache === 'number' && cache > 0
      ? getRouteCache(request, cache)
      : undefined;

  if (cached?.hit) {
    return new Response(cached.data, {
      headers: {
        ...headers,
        'Content-Type': 'image/svg+xml; charset=utf-8',
        'x-cache': 'HIT',
      },
    });
  }

  const badgeOption: Format = Object.create(null);
  const views = await stub.increment(slug);
  const message = formatNumber(views);
  const label =
    typeof url.searchParams.get('label') === 'string'
      ? url.searchParams.get('label')?.trim()
      : 'views';
  const color = url.searchParams.get('color')?.trim().toLowerCase();
  const labelColor = url.searchParams.get('labelColor')?.trim().toLowerCase();
  const styleParam = url.searchParams.get('style')?.trim().toLowerCase();
  const logoBase64 =
    typeof url.searchParams.get('logo') === 'string'
      ? decodeURIComponent(
          url.searchParams.get('logo')!.replace(/\s/g, '+')
        ).trim()
      : undefined;

  let style: Format['style'] = 'flat';
  if (
    styleParam === 'flat' ||
    styleParam === 'plastic' ||
    styleParam === 'flat-square' ||
    styleParam === 'for-the-badge' ||
    styleParam === 'social'
  )
    style = styleParam;

  if (label) badgeOption.label = label;
  if (color) badgeOption.color = normalizeHexColor(color);
  if (labelColor) badgeOption.labelColor = normalizeHexColor(labelColor);
  if (style) badgeOption.style = style;
  if (logoBase64)
    badgeOption.logoBase64 = `data:image/svg+xml;base64,${logoBase64}`;

  const svg = makeBadge({
    ...badgeOption,
    message,
  });

  setRouteCache(request, svg);

  return new Response(svg, {
    headers: {
      ...headers,
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'x-cache': 'MISS',
    },
  });
};
