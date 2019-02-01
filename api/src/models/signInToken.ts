import { db } from '../db';
import { decamelizeKeys } from 'humps';
import genAuthToken from '../util/genAuthToken';

export async function createSignInToken(email: string): Promise<string> {
  const [row] = await db!
    .insert(
      decamelizeKeys({
        email,
        token: await genAuthToken(),
      })
    )
    .returning('*')
    .into('sign_in_tokens');

  if (process.env.NODE_ENV === 'development') {
    console.log('');
    console.log(`*** Created sign-in token: ${row.token}`);
    console.log(`Or: ${process.env.APP_URL}/auth/sign-in?t=${row.token}`);
    console.log('');
  }

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
