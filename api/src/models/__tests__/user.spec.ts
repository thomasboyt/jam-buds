import expect from 'expect';
import { userFactory } from '../../__tests__/factories';
import { getUnfollowedUsersByTwitterIds } from '../user';
import { followUser } from '../following';

describe('models/user', () => {
  describe('getUnfollowedUsersByTwitterIds', () => {
    it('returns correct set of users', async () => {
      const userFollowedOnTwitterButNotJamBuds = await userFactory({
        twitterId: 'abc',
      });
      const userFollowedOnTwitterAndJamBuds = await userFactory({
        twitterId: 'def',
      });
      await userFactory({ twitterId: 'ghi' });

      const currentUser = await userFactory();
      await followUser(currentUser.id, userFollowedOnTwitterAndJamBuds.id);

      const unfollowed = await getUnfollowedUsersByTwitterIds(currentUser.id, [
        'abc',
        'def',
      ]);

      expect(unfollowed.length).toBe(1);
      expect(unfollowed[0].id).toBe(userFollowedOnTwitterButNotJamBuds.id);
    });
  });
});
