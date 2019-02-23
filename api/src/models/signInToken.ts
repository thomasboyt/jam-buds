import { db } from '../db';
import genAuthToken from '../util/genAuthToken';

export async function createSignInToken(email: string): Promise<string> {
  const [row] = await db!
    .insert({
      email,
      token: await genAuthToken(),
    })
    .returning('*')
    .into('sign_in_tokens');

  return row.token;
}

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

export async function getEmailFromSignInToken(
  token: string
): Promise<string | null> {
  const [row] = await db!
    .select('*')
    .from('sign_in_tokens')
    .where({ token });

  if (row) {
    return row.email;
  } else {
    return null;
  }
}

export async function deleteSignInToken(token: string): Promise<void> {
  await db!('sign_in_tokens')
    .where({ token })
    .delete();
}
