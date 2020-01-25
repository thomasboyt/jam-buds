import { Handle } from '@tboyt/jareth';

import { jareth, configureDatabase } from '../../db';

class TestTransactionRollbackError extends Error {}

export async function withTestTransaction<T>(
  cb: (handle: Handle) => Promise<T>
): Promise<T> {
  let val: T | undefined;
  try {
    await jareth!.withTransaction(async (handle) => {
      val = await cb(handle);
      throw new TestTransactionRollbackError();
    });
  } catch (err) {
    if (!(err instanceof TestTransactionRollbackError)) {
      throw err;
    }
  }
  return val!;
}

export function dbTest() {
  beforeAll(() => {
    configureDatabase();
  });

  afterAll(() => {
    jareth!.getPgpDb().$pool.end();
  });
}
