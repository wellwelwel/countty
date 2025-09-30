import { request } from '../../helpers/cli.js';

export async function create(
  slug: string,
  COUNTTY_URL: string,
  COUNTTY_TOKEN: string
) {
  const { data } = await request(`${COUNTTY_URL}/create`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${COUNTTY_TOKEN}`,
    },
    body: JSON.stringify({ slug }),
  });

  console.log(JSON.parse(data));
}
