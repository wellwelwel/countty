const SAFE_CHARS =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_+.*@!%&()[]';

export const tokenGenerate = (tokenSize = 32) => {
  return Array.from(
    { length: tokenSize },
    () => SAFE_CHARS[Math.floor(Math.random() * SAFE_CHARS.length)]
  ).join('');
};
