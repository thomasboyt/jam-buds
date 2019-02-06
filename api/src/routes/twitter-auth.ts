import { Router } from 'express';
import wrapAsyncRoute from '../util/wrapAsyncRoute';
import { OAuth } from 'oauth';
import {
  updateTwitterCredentials,
  User,
  deleteTwitterCredentialsFromUser,
} from '../models/user';
import { getUserFromCookie, isAuthenticated } from '../auth';

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

export default function registerTwitterAuthEndpoints(router: Router) {
  const oa = new OAuth(
    'https://api.twitter.com/oauth/request_token',
    'https://api.twitter.com/oauth/access_token',
    process.env.TWITTER_API_KEY!,
    process.env.TWITTER_API_SECRET!,
    '1.0A',
    `${process.env.APP_URL}/auth/twitter-connect/cb`,
    'HMAC-SHA1'
  );

  router.get('/twitter-connect', (req, res) => {
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

  router.get(
    '/twitter-connect/cb',
    wrapAsyncRoute(async (req, res) => {
      const user = await getUserFromCookie(req);

      oa.getOAuthAccessToken(
        req.query.oauth_token,
        '',
        req.query.oauth_verifier,
        (err: any, token: string, secret: string) => {
          if (err) {
            console.error(`Twitter access token error`);
            console.error(err);
            res.sendStatus(500);
            return;
          }

          // Get Twitter name and ID
          oa.get(
            'https://api.twitter.com/1.1/account/verify_credentials.json',
            token,
            secret,
            async (err: any, data: any) => {
              if (err) {
                console.error(`Twitter user fetch error`);
                console.error(err);
                res.sendStatus(500);
                return;
              }

              const twitterData = JSON.parse(data);
              const twitterId = twitterData.id_str;
              const twitterName = twitterData.screen_name;

              await updateTwitterCredentials(user, {
                twitterId,
                twitterName,
                twitterToken: token,
                twitterSecret: secret,
              });

              res.redirect(`${process.env.APP_URL}/settings`);
            }
          );
        }
      );
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
