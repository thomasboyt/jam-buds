import {Express} from 'express';
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

export default function registerTwitterEndpoints(app: Express) {
  const oa = new OAuth(
    'https://api.twitter.com/oauth/request_token',
    'https://api.twitter.com/oauth/access_token',
    process.env.TWITTER_API_KEY,
    process.env.TWITTER_API_SECRET,
    '1.0A',
    `${process.env.SERVER_URL}/twitter-sign-in-callback`,
    'HMAC-SHA1'
  );

  app.get('/twitter-sign-in', (req, res) => {
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

  app.get('/twitter-sign-in-callback', (req, res) => {
    oa.getOAuthAccessToken(req.query.oauth_token, '', req.query.oauth_verifier, (err: any, token: string, secret: string, authorizeUrl: string) => {
      if (err) {
        console.error(`Twitter access token error`);
        console.error(err);
        res.sendStatus(500);
        return;
      }

      const resp = `
      <html>
        <head>
          <script>
            window.opener.postMessage(JSON.stringify({
              type: 'twitterAuth',
              token: "${token}",
              secret: "${secret}",
            }), "${process.env.STATIC_URL}");
            window.close();
          </script>
        </head>
      </html>`;

      res.send(200, resp);
    });
  });

  app.post('/twitter-auth-token', async (req, res) => {
    const twitterToken = req.body.twitterToken;
    const twitterSecret = req.body.twitterSecret;

    oa.get('https://api.twitter.com/1.1/account/verify_credentials.json', twitterToken, twitterSecret, async (err: any, data: any) => {
      if (err) {
        console.error(`Twitter user fetch error`);
        console.error(err);
        res.sendStatus(500);
        return;
      }

      const twitterData = JSON.parse(data);
      const twitterId = twitterData.id_str;
      const twitterName = twitterData.screen_name;

      const twitterUser = await getUserByTwitterId(twitterId);

      if (!twitterUser) {
        const newUser = await createUser({twitterId, twitterName, twitterToken, twitterSecret});
        res.send(200, { authToken: newUser.authToken });

      } else {
        // TODO: if the user's twitter name changed, update it here
        res.send(200, { authToken: twitterUser.authToken });
      }
    });
  });
}