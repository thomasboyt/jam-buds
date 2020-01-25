import Jareth from '@tboyt/jareth';

export let jareth: Jareth | undefined;

// TODO: reimplement config system
export const dbUrl = process.env.DATABASE_URL!;

export function configureDatabase() {
  if (jareth) {
    return;
  }

  jareth = new Jareth(dbUrl);
}
