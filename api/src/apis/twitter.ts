import Twit from 'twit';
import config from '../config';
import { UserModel } from '../models/user';
import {
  getTwitterFollowingCache,
  setTwitterFollowingCache,
} from '../models/cache/twitterFollowingCache';
import { SongModel } from '../models/song';

interface PostSongTweetParams {
  text: string;
  user: UserModel;
  song: SongModel;
}

function getTwitterClient(user: UserModel): Twit {
  if (!user.twitterToken || !user.twitterSecret) {
    throw new Error(`missing twitter credentials for user ${user.email}`);
  }

  return new Twit({
    consumer_key: config.require('TWITTER_API_KEY'),
    consumer_secret: config.require('TWITTER_API_SECRET'),
    access_token: user.twitterToken,
    access_token_secret: user.twitterSecret,
  });
}

export async function postSongTweet({ text, song, user }: PostSongTweetParams) {
  const link = `${config.get('JB_APP_URL')}/users/${user.name}?song=${song.id}`;

  const tweet = `${text} ${link}`;

  await getTwitterClient(user).post('statuses/update', {
    status: tweet,
  });
}

export async function getTwitterFriendIds(user: UserModel): Promise<string[]> {
  const cachedIds = await getTwitterFollowingCache(user.id);
  if (cachedIds) {
    return cachedIds;
  }

  // the twit type defs are real bad so this is ugly
  const resp = await getTwitterClient(user).get('friends/ids', {
    stringify_ids: true,
  });

  if ((resp.data as any).errors) {
    console.error(resp.data);
    throw new Error('Error communicating with Twitter API');
  }

  const ids: string[] = (resp.data as any).ids;
  await setTwitterFollowingCache(user.id, ids);

  return ids;
}
