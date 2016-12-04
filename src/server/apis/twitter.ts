import {User} from '../models/user';
import * as Twit from 'twit';

interface PostSongTweetParams {
  text: string;
  user: User;
}

function getTwitterClient(user: User): Twit {
  return new Twit({
    consumer_key: process.env.TWITTER_API_KEY,
    consumer_secret: process.env.TWITTER_API_SECRET,
    access_token: user.twitterToken,
    access_token_secret: user.twitterSecret,
  });
}

export async function postSongTweet({text, user}: PostSongTweetParams) {
  const link = `${process.env.STATIC_URL}/playlist/${user.twitterName}`;

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