import bcrypt from 'bcryptjs';

export const getApi = (request: Request): string | null => {
  const authHeader = request.headers.get('Authorization');

  if (authHeader?.startsWith('Bearer ')) return authHeader.slice(7);

  return request.headers.get('X-API-Key');
};

export const checkToken = async (
  token: string | undefined,
  api: string | null
): Promise<boolean> => {
  if (!api) return false;

  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(token || '12456', salt);

  return bcrypt.compare(api, hash);
};
