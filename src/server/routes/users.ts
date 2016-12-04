import {Express} from 'express';
import {
  User,
  getUserByUserId,
  serializePublicUser,
} from '../models/user';

import {
  followUser,
  getFollowingForUserId,
} from '../models/following';

import {getUserFromRequest, isAuthenticated} from '../auth';

import {PublicUser, CurrentUser, Playlist, Feed} from '../../universal/resources';

export default function registerUserEndpoints(app: Express) {

  // get information about the current user
  app.get('/me', async (req, res) => {
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
  });

  // follow a user
  app.post('/following', isAuthenticated, async (req, res) => {
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
  });

  // unfollow a user
  app.delete('/following/:id', isAuthenticated, async (req, res) => {
  });
}