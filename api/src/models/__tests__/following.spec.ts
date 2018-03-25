/// <reference types="mocha" />

import * as expect from 'expect';

import { userFactory } from '../../__tests__/factories';
import { User } from '../../models/user';
import {
  followUser,
  getFollowersForUserId,
  getFollowingForUserId,
} from '../../models/following';

describe('models/following', () => {
  describe('querying', () => {
    let jeff: User;
    let vinny: User;
    let dan: User;

    beforeEach(async () => {
      jeff = await userFactory();
      vinny = await userFactory();
      dan = await userFactory();

      await followUser(jeff.id, vinny.id);
      await followUser(dan.id, jeff.id);
    });

    describe('getFollowingForUserId', () => {
      it('works', async () => {
        const following = await getFollowingForUserId(jeff.id);
        expect(following.length).toBe(1);
        expect(following[0].id).toBe(vinny.id);
      });
    });

    describe('getFollowersForUserId', () => {
      it('works', async () => {
        const followers = await getFollowersForUserId(jeff.id);
        expect(followers.length).toBe(1);
        expect(followers[0].id).toBe(dan.id);
      });
    });
  });
});
