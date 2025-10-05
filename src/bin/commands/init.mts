import { spawn } from 'node:child_process';
import { access, writeFile } from 'node:fs/promises';
import { basename } from 'node:path';
import { cwd, exit } from 'node:process';
import { env } from './resources/env.js';
import { footnote } from './resources/footnote.js';
import { gitignore } from './resources/gitignore.js';
import { packageJSON } from './resources/package.js';
import { tsconfig } from './resources/tsconfig.js';
import { workerPlugin, workerStandalone } from './resources/worker.js';
import { wrangler } from './resources/wrangler.js';

const exists = async (path: string) => {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
};

const createResource = async (path: string, content: string) => {
  await writeFile(path, content, 'utf-8');
  console.log(`✅ \x1b[2mCreated\x1b[0m \x1b[4m./${basename(path)}\x1b[0m`);
};

const npmInstall = async () => {
  return new Promise<void>((resolve, reject) => {
    console.log('\n📦 Installing dependencies...');

    const child = spawn('npm', ['install', '--ignore-scripts'], {
      shell: false,
    });

    child.on('close', () => {
      console.log('🎉 \x1b[1mCountty\x1b[0m project initialized successfully!');
      resolve();
    });
  });
};

export const init = async (mode: 'standalone' | 'plugin' = 'standalone') => {
  const currentDir = cwd();
  const path = {
    packageJSON: `${currentDir}/package.json`,
    tsconfig: `${currentDir}/tsconfig.json`,
    wrangler: `${currentDir}/wrangler.jsonc`,
    worker: `${currentDir}/worker.ts`,
    env: `${currentDir}/.env`,
    gitignore: `${currentDir}/.gitignore`,
  };

  const files = Object.values(path);
  const alreadyExists = await Promise.all(files.map((file) => exists(file)));

  if (alreadyExists.some((file) => file === true)) {
    const existingFiles = files
      .filter((_, index) => alreadyExists[index])
      .map((file) => `\x1b[1m\x1b[91m${basename(file)}\x1b[0m`);

    console.error(
      `${new Intl.ListFormat('en-US', { type: 'conjunction' }).format(existingFiles)} already exists in the current directory.`
    );
    exit(0);
  }

  const selectedWorker = mode === 'plugin' ? workerPlugin : workerStandalone;

  console.log(`
🔧 Initializing Countty project in \x1b[1m${mode}\x1b[0m mode...
    `);

  await Promise.all([
    createResource(path.wrangler, wrangler),
    createResource(path.worker, selectedWorker),
    createResource(path.env, env),
    createResource(path.gitignore, gitignore),
    createResource(path.packageJSON, await packageJSON()),
    createResource(path.tsconfig, tsconfig),
  ]);

  await npmInstall();

  console.log(footnote);
};
