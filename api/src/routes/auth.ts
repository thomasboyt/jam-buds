import { Router } from 'express';
import wrapAsyncRoute from '../util/wrapAsyncRoute';
import { AUTH_TOKEN_COOKIE } from '../constants';
import { OAuth } from 'oauth';
import {
  createUserFromTwitter,
  getUserByTwitterId,
  getUserByEmail,
  updateTwitterCredentials,
} from '../models/user';
import {
  createSignInToken,
  getEmailFromSignInToken,
  deleteSignInToken,
} from '../models/signInToken';
import { isAuthenticated } from '../auth';
import { validEmail } from '../util/validators';

/*
 * Here's how Twitter auth works:
 *
 * 1. The app server *proxies* /auth to the API server /auth, so that cookies can be set on the app
 *    server's host, and the user never sees the API server address in links, etc.
 *
 * 2. User vists /auth/twitter-sign-in. This gets a request token and redirects you to
 *    twitter.com/oauth/authenticate?oauth_token=${token} to do the Twitter OAuth flow.
 *
 * 3. Twitter redirects to api/twitter-sign-in-callback (as defined in OAuth app config).
 *
 * 4. This endpoint looks for a user by Twitter ID, creating the user if they do not exist,
 *    and sets a cookie with the auth token.
 */

export default function registerTwitterAuthEndpoints(router: Router) {
  const oa = new OAuth(
    'https://api.twitter.com/oauth/request_token',
    'https://api.twitter.com/oauth/access_token',
    process.env.TWITTER_API_KEY,
    process.env.TWITTER_API_SECRET,
    '1.0A',
    `${process.env.APP_URL}/auth/twitter-sign-in-callback`,
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
    oa.getOAuthAccessToken(
      req.query.oauth_token,
      '',
      req.query.oauth_verifier,
      (err: any, token: string, secret: string, authorizeUrl: string) => {
        if (err) {
          console.error(`Twitter access token error`);
          console.error(err);
          res.sendStatus(500);
          return;
        }

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

            let user = await getUserByTwitterId(twitterId);

            if (!user) {
              user = await createUserFromTwitter({
                name: twitterName,
                twitterId,
                twitterName,
                twitterToken: token,
                twitterSecret: secret,
              });
            } else {
              // Update user if needed
              if (
                !(user.twitterToken === token && user.twitterSecret === secret)
              ) {
                await updateTwitterCredentials({
                  twitterId,
                  twitterToken: token,
                  twitterSecret: secret,
                });
              }
            }

            res.cookie(AUTH_TOKEN_COOKIE, user.authToken);
            res.redirect(process.env.APP_URL!);
          }
        );
      }
    );
  });

  /**
   * POST /sign-in-token
   *
   * Create a new sign in or registration token and send an email to the
   * corresponding account.
   *
   * Params:
   * - email (string)
   */
  router.post(
    '/sign-in-token',
    wrapAsyncRoute(async (req, res) => {
      const email: string | undefined = req.body.email;

      if (!email) {
        res.status(400).json({ error: 'Missing email param' });
        return;
      }

      if (!validEmail(email)) {
        res.status(400).json({ error: 'Invalid email param' });
        return;
      }

      // TODO: Check to make sure existing sign-in token doesn't already exist.
      // Bail out if it does, or resend email if > 24 hours
      await createSignInToken(email);

      const user = await getUserByEmail(email);

      if (user) {
        // TODO: Send sign in email here
      } else {
        // TODO: Send registration email here
      }

      res.status(200).json({ success: true });
    })
  );

  /**
   * GET /sign-in
   *
   * Clicking on the magic link in your email redirects you here.
   */
  router.get(
    '/sign-in',
    wrapAsyncRoute(async (req, res) => {
      const token: string | undefined = req.query.t;

      // TODO: make better error pages for these since they're gonna be user-facing...

      if (!token) {
        res.status(400).send(`Missing token param`);
        return;
      }

      const email = await getEmailFromSignInToken(token);

      if (!email) {
        res.status(400).send(`Invalid token param`);
        return;
      }

      const user = await getUserByEmail(email);

      if (!user) {
        // this is a weird one, but I guess could happen if the user got deleted
        await deleteSignInToken(token);
        res.status(400).send(`no user found for email`);
        return;
      }

      await deleteSignInToken(token);
      res.cookie(AUTH_TOKEN_COOKIE, user.authToken);
      res.redirect(process.env.APP_URL!);
    })
  );

  router.post(
    '/sign-out',
    isAuthenticated,
    wrapAsyncRoute(async (req, res) => {
      // TODO: This should also delete the auth token from the database!
      res.clearCookie(AUTH_TOKEN_COOKIE);
      res.send(200);
    })
  );
}
