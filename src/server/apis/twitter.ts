import {User} from '../models/user';
import * as Twit from 'twit';

interface PostSongTweetParams {
  text: string;
  user: User;
}

export async function postSongTweet({text, user}: PostSongTweetParams) {
  const link = `${process.env.STATIC_URL}/playlist/${user.twitterName}`;

  const tweet = `${text} ${link}`;

  const TwitterClient = new Twit({
    consumer_key: process.env.TWITTER_API_KEY,
    consumer_secret: process.env.TWITTER_API_SECRET,
    access_token: user.twitterToken,
    access_token_secret: user.twitterSecret,
  });

  await TwitterClient.post('statuses/update', {
    status: tweet,
  });
}