#!/usr/bin/env node
import { mkdir, writeFile } from 'node:fs/promises';
import { argv, cwd, env, exit, loadEnvFile } from 'node:process';
import { help, request } from '../helpers/cli.js';

const { args, envPath } = (() => {
  const processedArgs = argv.slice(2);
  const envPathIndex = processedArgs.findIndex((arg) => arg === '--env');

  if (envPathIndex !== -1 && processedArgs[envPathIndex + 1]) {
    const envPath = processedArgs[envPathIndex + 1];
    processedArgs.splice(envPathIndex, 2);

    return {
      args: processedArgs,
      envPath,
    };
  }

  return {
    args: processedArgs,
    envPath: `${cwd()}/.env`,
  };
})();

loadEnvFile(envPath);

const command = args[0];
const slug: string | undefined = args[1];
const privateCommands = ['create', 'remove', 'reset', 'backup'];
const { COUNTTY_URL, COUNTTY_TOKEN } = env || Object.create(null);

if (args.length === 0 || ['help', '--help', '-h'].includes(args[0])) {
  help();
  exit(0);
}

if (!COUNTTY_URL) {
  console.error('❌ COUNTTY_URL not found in environment variables');
  console.error(
    'Set the COUNTTY_URL environment variable to use your Countty CLI helper.'
  );

  exit(1);
}

if (privateCommands.includes(command) && !COUNTTY_TOKEN) {
  console.error('❌ COUNTTY_TOKEN not found in environment variables');
  console.error(
    'Set the COUNTTY_TOKEN environment variable to use private routes.'
  );

  exit(1);
}

switch (command) {
  case 'create':
    const { data: create } = await request(`${COUNTTY_URL}/create`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${COUNTTY_TOKEN}`,
      },
      body: JSON.stringify({ slug }),
    });

    console.log(JSON.parse(create));

    break;

  case 'remove':
    const { data: remove } = await request(`${COUNTTY_URL}/remove`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${COUNTTY_TOKEN}`,
      },
      body: JSON.stringify({ slug }),
    });

    console.log(JSON.parse(remove));

    break;

  case 'reset':
    const { data: reset } = await request(`${COUNTTY_URL}/reset`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${COUNTTY_TOKEN}`,
      },
    });

    console.log(JSON.parse(reset));

    break;

  case 'backup':
    const { data: backup } = await request(`${COUNTTY_URL}/backup`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${COUNTTY_TOKEN}`,
      },
    });

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupsDir = 'backups';
    const filename = `${backupsDir}/countty-backup-${timestamp}.sql`;

    await mkdir(backupsDir, { recursive: true });
    await writeFile(filename, backup, 'utf-8');
    console.log(`🐬 Backup saved as: ./${filename}`);

    break;

  case 'views':
    const url = `${COUNTTY_URL}/views?slug=${encodeURIComponent(slug)}`;
    const viewsResponse = await request(url, { method: 'GET' });

    console.log(`🔗 ${url}`);
    console.log(JSON.parse(viewsResponse.data).views);

    break;

  default:
    console.error(`❌ Command "${command}" not recognized`);
    help();
    exit(1);
}
