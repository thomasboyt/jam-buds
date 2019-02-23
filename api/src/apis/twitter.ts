import Twit from 'twit';
import { UserModel } from '../models/user';

interface PostSongTweetParams {
  text: string;
  user: UserModel;
}

function getTwitterClient(user: UserModel): Twit {
  // TODO: This should probably be raised up out of this getter thingy
  if (!process.env.TWITTER_API_KEY || !process.env.TWITTER_API_SECRET) {
    throw new Error(
      'missing TWITTER_API_KEY and/or TWITTER_API_SECRET env variable'
    );
  }

  if (!user.twitterToken || !user.twitterSecret) {
    throw new Error(`missing twitter credentials for user ${user.email}`);
  }

  return new Twit({
    consumer_key: process.env.TWITTER_API_KEY,
    consumer_secret: process.env.TWITTER_API_SECRET,
    access_token: user.twitterToken,
    access_token_secret: user.twitterSecret,
  });
}

export async function postSongTweet({ text, user }: PostSongTweetParams) {
  const link = `${process.env.APP_URL}/users/${user.name}`;

  const tweet = `${text} ${link}`;

  await getTwitterClient(user).post('statuses/update', {
    status: tweet,
  });
}

export async function getTwitterFriendIds(user: UserModel): Promise<string[]> {
  // the twit type defs are real bad so this is ugly
  const resp = await getTwitterClient(user).get('friends/ids', {
    stringify_ids: true,
  });

  if ((resp.data as any).errors) {
    console.error(resp.data);
    throw new Error('Error communicating with Twitter API');
  }

  const users: string[] = (resp.data as any).ids;

  return users;
}
