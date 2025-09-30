import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '../../../..');

export const packageJSON = async () => {
  const basePackageJSON = JSON.parse(
    await readFile(join(projectRoot, 'package.json'), 'utf-8')
  );

  return `{
  "type": "module",
  "scripts": {
    "dev": "wrangler dev",
    "deploy": "wrangler deploy",
    "create": "countty create",
    "views": "countty views",
    "remove": "countty remove",
    "backup": "countty backup",
    "reset": "countty reset"
  },
  "devDependencies": {
    "@cloudflare/workers-types": "${basePackageJSON.devDependencies['@cloudflare/workers-types']}",
    "wrangler": "${basePackageJSON.devDependencies['wrangler']}"
  },
  "dependencies": {
    "countty": "^${basePackageJSON.version}"
  }
}
`;
};
