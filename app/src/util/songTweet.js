// TODO: this might change lol
export const TWEET_LENGTH = 280;
const TWITTER_URL_LENGTH = 23;

export function getTweetLength(tweet) {
  // one char is added for a space between the tweet and the URL
  return tweet.length + 1 + TWITTER_URL_LENGTH;
}

function defaultTweetTemplate(val) {
  return `I just posted ${val} to Jam Buds!`;
}

export function getDefaultTweet(artist, title) {
  let label = `"${title}" by ${artist}`;

  if (getTweetLength(defaultTweetTemplate(label)) > TWEET_LENGTH) {
    // try the title only first
    label = `"${title}"`;

    if (getTweetLength(defaultTweetTemplate(label)) > TWEET_LENGTH) {
      // truncate that shit I guess
      const toTruncate =
        getTweetLength(defaultTweetTemplate(label)) - TWEET_LENGTH;
      label = `"${label.slice(0, -(toTruncate + 1)) + '…'}"`;
    }
  }

  return defaultTweetTemplate(label);
}
