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
    it('creates a sign-in token if a user exists with the passed email', async () => {
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

    it("does not create a token if a user doesn't exist with the passed email", async () => {
      const email = 'foo@foobar.foo';

      const req = request(app)
        .post('/auth/sign-in-token')
        .send({
          email,
        });

      const res = await req;
      expect(res.status).toBe(200);

      const token = await getSignInTokenByEmail(email);
      expect(token).toNotExist();
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

  describe.only('GET /sign-in', () => {
    it('signs in with a valid token', async () => {
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
  });
});
