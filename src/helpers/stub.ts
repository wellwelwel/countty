import { CounttyClass, CounttyStub, Env } from 'src/@types.js';

export const resolveStub = (
  Countty: CounttyStub | CounttyClass,
  env: Env,
  stubName: string = 'countty'
): CounttyStub => {
  if (typeof Countty === 'object' && Countty !== null && 'increment' in Countty)
    return Countty;

  if (typeof Countty === 'function' && env && env.countty) {
    const id = env.countty.idFromName(stubName);
    return env.countty.get(id);
  }

  throw new Error(
    'Unable to resolve Countty stub. Make sure to provide `env` when using Countty class constructor.'
  );
};
