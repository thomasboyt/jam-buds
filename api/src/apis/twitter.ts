import {User} from '../models/user';
import * as Twit from 'twit';

interface PostSongTweetParams {
  text: string;
  user: User;
}

function getTwitterClient(user: User): Twit {
  // TODO: This should probably be raised up out of this getter thingy
  if (!process.env.TWITTER_API_KEY || !process.env.TWITTER_API_SECRET) {
    throw new Error('missing TWITTER_API_KEY and/or TWITTER_API_SECRET env variable')
  }

  return new Twit({
    consumer_key: process.env.TWITTER_API_KEY,
    consumer_secret: process.env.TWITTER_API_SECRET,
    access_token: user.twitterToken,
    access_token_secret: user.twitterSecret,
  });
}

export async function postSongTweet({text, user}: PostSongTweetParams) {
  const link = `${process.env.APP_URL}/users/${user.twitterName}`;

  const tweet = `${text} ${link}`;

  await getTwitterClient(user).post('statuses/update', {
    status: tweet,
  });
}

export async function getTwitterFriendIds(user: User): Promise<string[]> {
  // the twit type defs are real bad so this is ugly
  const resp = await getTwitterClient(user).get('friends/ids', {
    stringify_ids: true,
  } as Object);

  const users: string[] = (resp.data as any).ids;

  return users;
}