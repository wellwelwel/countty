import { request } from '../../helpers/cli.js';

export async function create(
  slug: string,
  COUNTTY_URL: string,
  COUNTTY_TOKEN: string
) {
  const url = `${COUNTTY_URL}/views?slug=${encodeURIComponent(slug)}`;
  const { data } = await request(`${COUNTTY_URL}/create`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${COUNTTY_TOKEN}`,
    },
    body: JSON.stringify({ slug }),
  });

  console.log('✨', JSON.parse(data));
  console.log(`🔗 Permanent URL: \x1b[94m\x1b[1m${url}\x1b[0m`);
}
