import { tokenGenerate } from '../../../helpers/token-generator.js';

export const env = `COUNTTY_URL='http://localhost:8787'
COUNTTY_TOKEN='${tokenGenerate(100)}'
`;
