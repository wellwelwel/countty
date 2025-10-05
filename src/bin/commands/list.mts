import { request } from '../../helpers/cli.js';

export const list = async (COUNTTY_URL: string, COUNTTY_TOKEN: string) => {
  const { data } = await request(`${COUNTTY_URL}/list`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${COUNTTY_TOKEN}`,
    },
  });

  const content = typeof data === 'string' ? JSON.parse(data) : data;

  console.log();
  console.log('Total:', content.total);
  console.log();
  console.table(content.slugs);
  console.log();
};
