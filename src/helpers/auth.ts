import bcrypt from 'bcryptjs';

export const getApi = (request: Request): string | undefined => {
  const authHeader = request.headers.get('Authorization');

  if (authHeader?.startsWith('Bearer ')) return authHeader.slice(7);
};

export const checkToken = async (
  token: string | undefined,
  api: string | undefined
): Promise<boolean> => {
  if (!api) return false;

  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(token || '123456', salt);

  return bcrypt.compare(api, hash);
};
