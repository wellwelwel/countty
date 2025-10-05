import { readFile } from 'node:fs/promises';
import { request } from '../../helpers/cli.js';

export const restore = async (
  path: string,
  COUNTTY_URL: string,
  COUNTTY_TOKEN: string
) => {
  const { data } = await request(`${COUNTTY_URL}/restore`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${COUNTTY_TOKEN}`,
    },
    body: await readFile(path, 'utf-8'),
  });

  console.log(typeof data === 'string' ? JSON.parse(data) : data);
};
