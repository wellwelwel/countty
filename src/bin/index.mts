#!/usr/bin/env node
import { existsSync } from 'node:fs';
import { argv, cwd, env, exit, loadEnvFile } from 'node:process';
import { help } from '../helpers/cli.js';
import { backup } from './commands/backup.mjs';
import { create } from './commands/create.mjs';
import { remove } from './commands/remove.mjs';
import { reset } from './commands/reset.mjs';
import { views } from './commands/views.mjs';

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

if (existsSync(envPath)) loadEnvFile(envPath);

const { COUNTTY_URL, COUNTTY_TOKEN } = env || Object.create(null);

if (!COUNTTY_URL) {
  console.error('❌ COUNTTY_URL not found in environment variables.');
  console.error(
    'Set the COUNTTY_URL environment variable to use your Countty CLI helper.'
  );

  exit(1);
}

if (!COUNTTY_TOKEN) {
  console.error('❌ COUNTTY_TOKEN not found in environment variables.');
  console.error(
    'Set the COUNTTY_TOKEN environment variable to use your Countty CLI helper.'
  );

  exit(1);
}

if (args.length === 0 || ['help', '--help', '-h'].includes(args[0])) {
  help();
  exit(0);
}

const command = args[0]?.trim().toLowerCase();
const slug = args[1]?.trim();

switch (command) {
  case 'create':
    await create(slug, COUNTTY_URL, COUNTTY_TOKEN);
    break;

  case 'remove':
    await remove(slug, COUNTTY_URL, COUNTTY_TOKEN);
    break;

  case 'reset':
    await reset(COUNTTY_URL, COUNTTY_TOKEN);
    break;

  case 'backup':
    await backup(COUNTTY_URL, COUNTTY_TOKEN);
    break;

  case 'views':
    await views(slug, COUNTTY_URL);
    break;

  default:
    console.error(`❌ Command "${command}" not recognized.`);

    help();
    exit(1);
}
