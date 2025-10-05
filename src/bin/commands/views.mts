import { request } from '../../helpers/cli.js';

export const views = async (slug: string, COUNTTY_URL: string) => {
  const url = `${COUNTTY_URL}/views?slug=${encodeURIComponent(slug)}`;
  const { data } = await request(url, { method: 'GET' });

  console.log('📊 Views', data.views);
  console.log(`🔗 Permanent URL: \x1b[94m\x1b[1m${url}\x1b[0m`);
};
