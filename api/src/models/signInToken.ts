import { db } from '../db';

export async function getSignInTokenByEmail(
  email: string
): Promise<string | null> {
  const [row] = await db!
    .select('*')
    .from('sign_in_tokens')
    .where({ email });

  if (row) {
    return row.token;
  } else {
    return null;
  }
}
