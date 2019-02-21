import { Router } from 'express';
import wrapAsyncRoute from '../util/wrapAsyncRoute';
import { AUTH_TOKEN_COOKIE } from '../constants';
import { getUserByEmail, getUserByName, createUser } from '../models/user';
import {
  createSignInToken,
  getEmailFromSignInToken,
  deleteSignInToken,
} from '../models/signInToken';
import { isAuthenticated } from '../auth';
import { validEmail, validUsername } from '../util/validators';
import { Fields, validate } from '../util/validation';
import { sendEmail } from '../util/email';
import {
  setSignUpReferral,
  getAndClearSignUpReferral,
} from '../models/cache/signUpReferralCache';
import { followUser } from '../models/following';

export default function registerAuthEndpoints(router: Router) {
  /**
   * POST /sign-in-token
   *
   * Create a new sign in or registration token and send an email to the
   * corresponding account.
   *
   * Params:
   * - email (string)
   * - signupReferral (string) - optional, saves a referral for the sign up
   *   token who will get automatically followed on sign up
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
      const token = await createSignInToken(email);

      const user = await getUserByEmail(email);

      if (user) {
        const link = `${process.env.APP_URL}/auth/sign-in?t=${token}`;

        await sendEmail(email, 'Your sign-in link for jambuds.club', {
          templateName: 'log-in',
          data: {
            name: user.name,
            logInLink: link,
          },
        });
      } else {
        if (req.body.signupReferral) {
          await setSignUpReferral(token, req.body.signupReferral);
        }

        const link = `${process.env.APP_URL}/welcome/registration?t=${token}`;

        await sendEmail(email, 'Welcome to jambuds.club!', {
          templateName: 'sign-up',
          data: {
            registrationLink: link,
          },
        });
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

  /**
   * POST /registration
   *
   * Create a new account, given a sign-in token ("registration token") corresponding to an unregistered email, and a
   */
  router.post(
    '/registration',
    wrapAsyncRoute(async (req, res) => {
      const token = req.body.token;

      if (!token) {
        res.status(400).json({ error: 'Missing registration token' });
        return;
      }

      const email = await getEmailFromSignInToken(token);

      if (!email) {
        res.status(400).json({ error: `No record found for token ${token}` });
        return;
      }

      const fields: Fields = {
        name: {
          required: true,
          label: 'Name',
          rules: [
            {
              text: 'Username is invalid',
              isValid: validUsername,
            },
            {
              text: 'This username has already been taken',
              isValid: async (name) => !(await getUserByName(name)),
            },
          ],
        },
      };

      const { errors } = await validate(req.body, fields);

      if (errors) {
        res.status(400).json({ errors });
        return;
      }

      if (await getUserByEmail(email)) {
        res.status(400).json({ error: 'User already exists' });
        return;
      }

      // Create user
      const user = await createUser({
        email,
        name: req.body.name,
      });

      await deleteSignInToken(token);
      res.cookie(AUTH_TOKEN_COOKIE, user.authToken);

      // auto follow referral if present
      const referral = await getAndClearSignUpReferral(token);

      if (referral) {
        const referralUser = await getUserByName(referral);
        if (referralUser) {
          await followUser(user.id, referralUser.id);
        }
      }

      res.status(200).json({ success: true });
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
