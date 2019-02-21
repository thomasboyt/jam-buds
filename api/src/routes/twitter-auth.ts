import { Router } from 'express';
import wrapAsyncRoute from '../util/wrapAsyncRoute';
import { OAuth } from 'oauth';
import {
  updateTwitterCredentials,
  User,
  deleteTwitterCredentialsFromUser,
} from '../models/user';
import { getUserFromCookie, isAuthenticated } from '../auth';
import {
  createOAuthState,
  getAndClearOAuthState,
} from '../util/oauthStateCache';

/*
 * Here's how Twitter auth works:
 *
 * 1. The app server *proxies* /auth to the API server /auth, so that cookies
 *    can be set on the app server's host, and the user never sees the API
 *    server address in links, etc.
 *
 * 2. User vists /auth/twitter-connect. This gets a request token and redirects
 *    you to twitter.com/oauth/authenticate?oauth_token=${token} to do the
 *    Twitter OAuth flow.
 *
 * 3. Twitter redirects to /auth/twitter-connect/cb (as defined in OAuth app
 *    config).
 *
 * 4. The user is updated with their Twitter information.
 */

function createOAuthClient(stateToken: string): OAuth {
  return new OAuth(
    'https://api.twitter.com/oauth/request_token',
    'https://api.twitter.com/oauth/access_token',
    process.env.TWITTER_API_KEY!,
    process.env.TWITTER_API_SECRET!,
    '1.0A',
    `${process.env.APP_URL}/auth/twitter-connect/cb?state=${stateToken}`,
    'HMAC-SHA1'
  );
}

export default function registerTwitterAuthEndpoints(router: Router) {
  router.get(
    '/twitter-connect',
    wrapAsyncRoute(async (req, res) => {
      const state = await createOAuthState(req.query.redirect || '/');

      const token = await new Promise((resolve, reject) => {
        createOAuthClient(state).getOAuthRequestToken(
          (err: any, token: string) => {
            if (err) {
              console.error(`Twitter request token error`);
              return reject(err);
            }
            resolve(token);
          }
        );
      });

      const authUrl = `https://twitter.com/oauth/authenticate?oauth_token=${token}`;

      res.redirect(authUrl);
    })
  );

  router.get(
    '/twitter-connect/cb',
    wrapAsyncRoute(async (req, res) => {
      const state = req.query.state;
      const redirect = await getAndClearOAuthState(state);

      if (!redirect) {
        return res.status(400).send('Invalid state param');
      }

      const user = await getUserFromCookie(req);

      const oa = createOAuthClient(state);

      const { token, secret } = await new Promise((resolve, reject) => {
        oa.getOAuthAccessToken(
          req.query.oauth_token,
          '',
          req.query.oauth_verifier,
          (err: any, token: string, secret: string) => {
            if (err) {
              console.error(`Twitter access token error`);
              return reject(err);
            }
            resolve({ token, secret });
          }
        );
      });

      // Get Twitter name and ID
      const data = await new Promise<string>((resolve, reject) => {
        oa.get(
          'https://api.twitter.com/1.1/account/verify_credentials.json',
          token,
          secret,
          (err, data) => {
            if (err) {
              console.error(`Twitter user fetch error`);
              return reject(err);
            }
            resolve(data as string);
          }
        );
      });

      const twitterData = JSON.parse(data);
      const twitterId = twitterData.id_str;
      const twitterName = twitterData.screen_name;

      await updateTwitterCredentials(user, {
        twitterId,
        twitterName,
        twitterToken: token,
        twitterSecret: secret,
      });

      res.redirect(`${process.env.APP_URL}${redirect}`);
    })
  );

  router.delete(
    '/twitter-connect',
    isAuthenticated,
    wrapAsyncRoute(async (req, res) => {
      const user: User = res.locals.user;

      await deleteTwitterCredentialsFromUser(user);

      res.status(200).json({ success: true });
    })
  );
}
