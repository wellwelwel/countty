import { request } from '../../helpers/cli.js';

export const list = async (COUNTTY_URL: string, COUNTTY_TOKEN: string) => {
  const { data } = await request(`${COUNTTY_URL}/list`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${COUNTTY_TOKEN}`,
    },
  });

  console.dir(JSON.parse(data), { depth: Infinity });
};
