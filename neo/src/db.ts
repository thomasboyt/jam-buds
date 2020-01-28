import Jareth from '@tboyt/jareth';
import config from './config';

// TODO: stop using this in tests
export let jareth: Jareth | undefined;

export const dbUrl = config.require('DATABASE_URL');

export function configureDatabase() {
  if (jareth) {
    return jareth;
  }

  jareth = new Jareth(dbUrl);
  return jareth;
}
