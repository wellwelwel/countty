import { mkdir, writeFile } from 'node:fs/promises';
import { request } from '../../helpers/cli.js';

export const backup = async (COUNTTY_URL: string, COUNTTY_TOKEN: string) => {
  const { data } = await request(`${COUNTTY_URL}/backup`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${COUNTTY_TOKEN}`,
    },
  });

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupsDir = 'backups';
  const filename = `${backupsDir}/countty-backup-${timestamp}.sql`;

  await mkdir(backupsDir, { recursive: true });
  await writeFile(filename, data, 'utf-8');

  console.log(`🐬 Backup saved at: ./${filename}`);
};
