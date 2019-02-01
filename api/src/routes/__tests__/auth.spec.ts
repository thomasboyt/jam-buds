/// <reference types="mocha" />

import * as expect from 'expect';
import * as request from 'supertest';

import createApp from '../../createApp';
import { db } from '../../db';
import { userFactory } from '../../__tests__/factories';
import { getSignInTokenByEmail } from '../../models/signInToken';
import { AUTH_TOKEN_COOKIE } from '../../constants';
import { getUserByEmail } from '../../models/user';

const app = createApp();

describe('routes/auth', () => {
  describe('POST /sign-in-token', () => {
    it('creates a sign-in token for an email', async () => {
      const user = await userFactory();

      const req = request(app)
        .post('/auth/sign-in-token')
        .send({
          email: user.email,
        });

      const res = await req;
      expect(res.status).toBe(200);

      const token = await getSignInTokenByEmail(user.email!);
      expect(token).toExist();
    });

    describe('email validation', () => {
      it('returns success for a valid email', async () => {
        const email = 'foo@foobar.foo';

        const req = request(app)
          .post('/auth/sign-in-token')
          .send({
            email: email,
          });

        const res: request.Response = await req;

        expect(res.status).toBe(200);
      });

      it('returns 400 for an invalid email', async () => {
        const email = 'foo';

        const req = request(app)
          .post('/auth/sign-in-token')
          .send({
            email: email,
          });

        const res: request.Response = await req;

        expect(res.status).toBe(400);
      });
    });
  });

  describe('GET /sign-in', () => {
    it('signs in with a valid token and existing user', async () => {
      let user = await userFactory();

      let res = await request(app)
        .post('/auth/sign-in-token')
        .send({
          email: user.email,
        });

      expect(res.status).toBe(200);

      let token = await getSignInTokenByEmail(user.email!);

      res = await request(app)
        .get('/auth/sign-in')
        .query({ t: token });
      expect(res.status).toBe(302);

      user = (await getUserByEmail(user.email!))!;
      const cookieRe = new RegExp(`${AUTH_TOKEN_COOKIE}=${user.authToken}`);
      expect(res.header['set-cookie']).toMatch(cookieRe);

      token = await getSignInTokenByEmail(user.email!);
      expect(token).toNotExist();
    });

    it('redirects to registration screen with valid token and nonexistent user', async () => {
      throw new Error('TODO');
    });
  });
});
