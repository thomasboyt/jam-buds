import Jareth from '@tboyt/jareth';

// TODO: stop using this in tests
export let jareth: Jareth | undefined;

// TODO: reimplement config system
export const dbUrl = process.env.DATABASE_URL!;

export function configureDatabase() {
  if (jareth) {
    return jareth;
  }

  jareth = new Jareth(dbUrl);
  return jareth;
}
