#!/usr/bin/env node
import { existsSync } from 'node:fs';
import { argv, cwd, env, exit, loadEnvFile } from 'node:process';
import { help } from '../helpers/cli.js';
import { backup } from './commands/backup.mjs';
import { create } from './commands/create.mjs';
import { init } from './commands/init.mjs';
import { list } from './commands/list.mjs';
import { remove } from './commands/remove.mjs';
import { reset } from './commands/reset.mjs';
import { restore } from './commands/restore.mjs';
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

if (
  args.length === 0 ||
  ['--help', '-h'].includes(args[0].trim().toLowerCase())
) {
  help();
  exit(0);
}

if (args[0].trim().toLowerCase() === 'init') {
  const mode = args.includes('--plugin') ? 'plugin' : 'standalone';

  await init(mode);
  exit(0);
}

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

const command = args[0]?.trim().toLowerCase();
const param = args[1]?.trim();

const route = {
  create: () => create(param, COUNTTY_URL, COUNTTY_TOKEN),
  views: () => views(param, COUNTTY_URL),
  remove: () => remove(param, COUNTTY_URL, COUNTTY_TOKEN),
  backup: () => backup(COUNTTY_URL, COUNTTY_TOKEN),
  list: () => list(COUNTTY_URL, COUNTTY_TOKEN),
  reset: () => reset(COUNTTY_URL, COUNTTY_TOKEN),
  restore: () => restore(param, COUNTTY_URL, COUNTTY_TOKEN),
  default: () => {
    console.error(`❌ Command "${command}" not recognized.`);

    help();
    exit(1);
  },
} as const;

(route[command as keyof typeof route] || route.default)();
