import {Router} from 'express';
import wrapAsyncRoute from '../util/wrapAsyncRoute';
import {AUTH_TOKEN_COOKIE} from '../../universal/constants';
import {OAuth} from 'oauth';
import {createUser, getUserByTwitterId} from '../models/user';

/*
 * Here's how Twitter auth works:
 * 1. Visit /twitter-sign-in in a new window. This gets a request token and sends you to
 *    twitter.com/oauth/authenticate to do the Twitter OAuth flow.
 *
 * 2. Get redirected to /twitter-sign-in-callback. This page gets an access token, and then
 *    sends it back to the original page using window.opener.postMessage.
 *
 * 3. Original page then sends the Twitter token+secret to POST /twitter-auth-token, along with
 *    their Jam Buds auth token. This endpoint either fetches the account already associated with
 *    this Twitter ID, or creates a new account and auth token.
 *    Either way, an auth token is returned that is the new Jam Buds auth token for the client.
 *    The client sets this auth token and refreshes.
 */

export default function registerTwitterEndpoints(router: Router) {
  const oa = new OAuth(
    'https://api.twitter.com/oauth/request_token',
    'https://api.twitter.com/oauth/access_token',
    process.env.TWITTER_API_KEY,
    process.env.TWITTER_API_SECRET,
    '1.0A',
    `${process.env.API_URL}/twitter-sign-in-callback`,
    'HMAC-SHA1'
  );

  router.get('/twitter-sign-in', (req, res) => {
    oa.getOAuthRequestToken((err: any, token: string) => {
      if (err) {
        console.error(`Twitter request token error`);
        console.error(err);
        res.sendStatus(500);
        return;
      }

      const authUrl = `https://twitter.com/oauth/authenticate?oauth_token=${token}`;

      res.redirect(authUrl);
    });
  });

  router.get('/twitter-sign-in-callback', (req, res) => {
    oa.getOAuthAccessToken(req.query.oauth_token, '', req.query.oauth_verifier, (err: any, token: string, secret: string, authorizeUrl: string) => {
      if (err) {
        console.error(`Twitter access token error`);
        console.error(err);
        res.sendStatus(500);
        return;
      }

      oa.get('https://api.twitter.com/1.1/account/verify_credentials.json', token, secret, async (err: any, data: any) => {
        if (err) {
          console.error(`Twitter user fetch error`);
          console.error(err);
          res.sendStatus(500);
          return;
        }

        const twitterData = JSON.parse(data);
        const twitterId = twitterData.id_str;
        const twitterName = twitterData.screen_name;

        let user = await getUserByTwitterId(twitterId);

        if (!user) {
          user = await createUser({
            twitterId, twitterName, twitterToken: token, twitterSecret: secret
          });
        }

        res.cookie(AUTH_TOKEN_COOKIE, user.authToken);
        res.redirect('/');
      });
    });
  });
}