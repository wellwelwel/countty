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

  console.log('✨', JSON.parse(data), '\n');
  console.log(`🔗 Permanent URL: \x1b[94m\x1b[1m${url}\x1b[0m`);
  console.log(
    `🛡️  Badge Example: \x1b[94m\x1b[1mhttps://img.shields.io/badge/dynamic/json?url=${encodeURIComponent(url)}&query=${encodeURIComponent('$.label')}&logo=target&logoColor=ffffff&label=views&labelColor=70a1ff&color=%232088FF&cacheSeconds=0
\x1b[0m`
  );
  console.log(
    '💡 \x1b[1mNote:\x1b[0m Naturally, local addresses do not work for badges.'
  );
}
