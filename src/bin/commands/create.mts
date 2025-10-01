import { request } from '../../helpers/cli.js';

export const create = async (
  slug: string,
  COUNTTY_URL: string,
  COUNTTY_TOKEN: string
) => {
  const url = `${COUNTTY_URL}/views?slug=${encodeURIComponent(slug)}`;
  const badge = `${COUNTTY_URL}/badge?slug=${encodeURIComponent(slug)}`;
  const { data } = await request(`${COUNTTY_URL}/create`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${COUNTTY_TOKEN}`,
    },
    body: JSON.stringify({ slug }),
  });

  console.log('✨', JSON.parse(data), '\n');
  console.log(`🔗 Permanent URL: \x1b[94m\x1b[1m${url}\x1b[0m`);
  console.log(`🛡️  Badge: \x1b[94m\x1b[1m${badge}\x1b[0m`);
};
