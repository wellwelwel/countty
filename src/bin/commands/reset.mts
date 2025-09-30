import { request } from '../../helpers/cli.js';

export async function reset(COUNTTY_URL: string, COUNTTY_TOKEN: string) {
  const { data } = await request(`${COUNTTY_URL}/reset`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${COUNTTY_TOKEN}`,
    },
  });

  console.log(JSON.parse(data));
}
