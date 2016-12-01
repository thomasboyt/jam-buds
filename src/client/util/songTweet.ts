import serializeSongLabel from './serializeSongLabel';
import {SearchResult} from '../../universal/resources';

// TODO: this might change lol
const TWITTER_URL_LENGTH = 23;

export function getTweetLength(tweet: string): number {
  // one char is added for a space between the tweet and the URL
  return tweet.length + 1 + TWITTER_URL_LENGTH;
}

function defaultTweetTemplate(val: string): string {
  return `I just posted "${val}" to Jam Buds!`;
}

export function getDefaultTweet(song: SearchResult): string {
  let label = serializeSongLabel(song);

  if (getTweetLength(defaultTweetTemplate(label)) > 140) {
    // try the title only first
    label = song.name;

    if (getTweetLength(defaultTweetTemplate(label)) > 140) {
      // truncate that shit I guess
      const toTruncate = getTweetLength(defaultTweetTemplate(label)) - 140;
      label = label.slice(0, -(toTruncate + 1)) + '…';
    }
  }

  return defaultTweetTemplate(label);
}
