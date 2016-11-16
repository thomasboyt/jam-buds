import {db} from '../db';
import * as crypto from 'crypto';
import {camelizeKeys, decamelizeKeys} from 'humps';

function genAuthToken(): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    crypto.randomBytes(24, (err, buf) => {
      if (err) {
        reject(err);
        return;
      }

      const str = buf.toString('hex') + Date.now();
      resolve(str);
    });
  });
}

interface User {
  id: number;
  authToken: string;
  twitterId: string;
  twitterName: string;
  twitterToken: string;
  twitterSecret: string;
}

interface CreateUserOptions {
  twitterId: string;
  twitterName: string;
  twitterToken: string;
  twitterSecret: string;
}

export async function createUser(opts: CreateUserOptions): Promise<User> {
  const authToken = await genAuthToken();

  const insert = Object.assign({authToken}, opts);

  const query = db!.insert(decamelizeKeys(insert)).returning('*').into('users');

  const [row] = await (query as any);
  const user = camelizeKeys(row) as User;

  return user;
}

export async function getUserByTwitterId(id: string): Promise<User | null> {
  const query = db!('users').where({twitter_id: id});

  const [row] = await (query as any);

  if (!row) {
    return null;
  }

  const user = camelizeKeys(row) as User;

  return user;
}

export async function getUserByAuthToken(authToken: string): Promise<User | null> {
  const query = db!('users').where({auth_token: authToken});

  const [row] = await (query as any);

  if (!row) {
    return null;
  }

  const user = camelizeKeys(row) as User;

  return user;
}
