import {db} from '../db';
import genAuthToken from '../util/genAuthToken';
import {camelizeKeys, decamelizeKeys} from 'humps';
import {PublicUser} from '../../universal/resources';

export interface User {
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

export function serializePublicUser(user: User): PublicUser {
  return {
    id: user.id,
    twitterName: user.twitterName,
  };
}

export async function createUser(opts: CreateUserOptions): Promise<User> {
  const authToken = await genAuthToken();

  const insert = Object.assign({authToken}, opts);

  const query = db!.insert(decamelizeKeys(insert)).returning('*').into('users');

  const [row] = await (query as any);
  const user = camelizeKeys(row) as User;

  return user;
}

async function getUserWhere(params: any) {
  const query = db!('users').where(params);

  const [row] = await (query as any);

  if (!row) {
    return null;
  }

  const user = camelizeKeys(row) as User;

  return user;
}

export async function getUserByAuthToken(authToken: string): Promise<User | null> {
  return await getUserWhere({auth_token: authToken});
}

export async function getUserByTwitterId(id: string): Promise<User | null> {
  return await getUserWhere({twitter_id: id});
}

export async function getUserByTwitterName(name: string): Promise<User | null> {
  return await getUserWhere({twitter_name: name});
}

export async function getUserByUserId(id: number): Promise<User | null> {
  return await getUserWhere({id});
}

export async function getUsersByTwitterIds(ids: string[]): Promise<User[]> {
  const query = db!.select('*').from('users').whereIn('twitter_id', ids);

  const rows = await (query as any);
  const users: User[] = rows.map((row: any) => camelizeKeys(row));

  return users;
}