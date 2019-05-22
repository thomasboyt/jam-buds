import '../util/loadDotEnv';
import misterResetti from '../util/misterResetti';

import { db } from '../db';

before(async function() {
  this.timeout(10000);
  await misterResetti({});
});

beforeEach(async () => {
  await db!.raw('BEGIN');
});

afterEach(async () => {
  await db!.raw('ROLLBACK');
});
