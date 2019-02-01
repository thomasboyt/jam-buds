/// <reference types="mocha" />

import * as expect from 'expect';
import * as request from 'supertest';

import createApp from '../../createApp';
import { db } from '../../db';
import { AUTH_TOKEN_COOKIE } from '../../constants';
import { userFactory } from '../../__tests__/factories';
import {
  createSignInToken,
  getSignInTokenByEmail,
} from '../../models/signInToken';
import { getUserByEmail } from '../../models/user';

const app = createApp();

describe('routes/users', () => {
  describe('POST /users', () => {
    it('requires a sign-in token', async () => {
      const res = await request(app)
        .post('/api/users')
        .send({
          token: null,
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Missing registration token');
    });

    it('creates a new user given a sign-in token and registration form', async () => {
      const email = 'example@example.example';
      const token = await createSignInToken(email);

      const res = await request(app)
        .post('/api/users')
        .send({
          token,
          name: 'bob',
        });

      expect(res.status).toBe(200);

      expect(await getSignInTokenByEmail(email)).toBe(null);

      const user = (await getUserByEmail(email))!;
      const cookieRe = new RegExp(`${AUTH_TOKEN_COOKIE}=${user.authToken}`);
      expect(res.header['set-cookie']).toMatch(cookieRe);
    });

    it('returns an error if the email is associated with a user', async () => {
      const user = await userFactory();
      const token = await createSignInToken(user.email!);

      const res = await request(app)
        .post('/api/users')
        .send({
          token,
          name: 'bob',
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('User already exists');
    });

    it('returns an error given an invalid username', async () => {
      const res = await request(app)
        .post('/api/users')
        .send({
          token: await createSignInToken('example@example.example'),
        });

      expect(res.status).toBe(400);
      expect(res.body.errors[0].text).toBe('Name is required');
    });
  });
});
