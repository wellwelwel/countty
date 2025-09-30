import { request } from '../../helpers/cli.js';

export async function views(slug: string | undefined, COUNTTY_URL: string) {
  const url = `${COUNTTY_URL}/views?slug=${encodeURIComponent(slug || '')}`;
  const { data } = await request(url, { method: 'GET' });

  console.log(`🔗 ${url}`);
  console.log(JSON.parse(data).views);
}
