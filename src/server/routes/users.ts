import {Express} from 'express';
import wrapAsyncRoute from '../util/wrapAsyncRoute';

import {
  User,
  getUserByUserId,
  serializePublicUser,
  getUnfollowedUsersByTwitterIds,
} from '../models/user';

import {
  followUser,
  getFollowingForUserId,
} from '../models/following';

import {getUserFromRequest, isAuthenticated} from '../auth';
import {getTwitterFriendIds} from '../apis/twitter';

import {PublicUser, CurrentUser, Playlist, Feed} from '../../universal/resources';

export default function registerUserEndpoints(app: Express) {

  // get information about the current user
  app.get('/me', wrapAsyncRoute(async (req, res) => {
    const user = await getUserFromRequest(req);

    if (!user) {
      res.json({
        user: null,
      });

    } else {
      const followingUsers = await getFollowingForUserId(user.id);

      const serializedUsers: PublicUser[] = followingUsers.map(serializePublicUser);

      const currentUser: CurrentUser = {
        id: user.id,
        name: user.twitterName,
        following: serializedUsers,
      };

      res.json({
        user: currentUser,
      });
    }
  }));

  // follow a user
  app.post('/following', isAuthenticated, wrapAsyncRoute(async (req, res) => {
    const user: User = res.locals.user;
    const followingId: number = req.body.userId;

    if (!followingId) {
      res.status(400).json({
        error: 'Missing userId parameter in body'
      });

      return;
    }

    const followingUser = await getUserByUserId(followingId);

    if (!followingUser) {
      res.status(400).json({
        error: `Could not find user with ID ${followingId}`
      });

      return;
    }

    await followUser(user.id, followingId);

    res.json({
      user: serializePublicUser(followingUser),
    });
  }));

  // unfollow a user
  app.delete('/following/:id', isAuthenticated, wrapAsyncRoute(async (req, res) => {
  }));

  // get twitter friends who have signed up
  app.get('/friend-suggestions', isAuthenticated, wrapAsyncRoute(async (req, res) => {
    // get a list of twitter IDs!
    const ids = await getTwitterFriendIds(res.locals.user);

    const users = await getUnfollowedUsersByTwitterIds(res.locals.user.id, ids);

    const publicUsers = users.map((row) => serializePublicUser(row));

    res.status(200).send({
      users: users,
    });
  }));
}