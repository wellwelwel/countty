export const hash = async (text: string): Promise<string> => {
  const data = new TextEncoder().encode(text);
  const hash = await crypto.subtle.digest({ name: 'SHA-256' }, data);
  const array = Array.from(new Uint8Array(hash));

  return array.map((buffer) => buffer.toString(16).padStart(2, '0')).join('');
};
