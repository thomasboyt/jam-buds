import {Express} from 'express';
import wrapAsyncRoute from '../util/wrapAsyncRoute';

import {
  User,
  getUserByTwitterName,
  serializePublicUser,
  getUnfollowedUsersByTwitterIds,
} from '../models/user';

import {
  followUser,
  unfollowUser,
  getFollowingForUserId,
  getFollowersForUserId,
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
    const followingName: string = req.body.userName;

    if (!followingName) {
      res.status(400).json({
        error: 'Missing userName parameter in body'
      });

      return;
    }

    const followingUser = await getUserByTwitterName(followingName);

    if (!followingUser) {
      res.status(400).json({
        error: `Could not find user with name ${followingName}`
      });

      return;
    }

    await followUser(user.id, followingUser.id);

    res.json({
      user: serializePublicUser(followingUser),
    });
  }));

  // unfollow a user
  app.delete('/following/:followingName', isAuthenticated, wrapAsyncRoute(async (req, res) => {
    const user: User = res.locals.user;
    const followingName: string = req.params.followingName;

    const followingUser = await getUserByTwitterName(followingName);

    if (!followingUser) {
      res.status(400).json({
        error: `Could not find user with name ${followingName}`
      });

      return;
    }

    await unfollowUser(user.id, followingUser.id);

    res.json({
      success: true,
    });
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

  app.get('/users/:userName/following', isAuthenticated, wrapAsyncRoute(async (req, res) => {
    const userName: string = req.params.userName;

    const user = await getUserByTwitterName(userName);

    if (!user) {
      res.status(400).json({
        error: `Could not find user with name ${userName}`
      });

      return;
    }

    const following = await getFollowingForUserId(user.id);

    const publicUsers = following.map((row) => serializePublicUser(row));

    res.json({
      users: publicUsers,
    });
  }));

  app.get('/users/:userName/followers', isAuthenticated, wrapAsyncRoute(async (req, res) => {
    const userName: string = req.params.userName;

    const user = await getUserByTwitterName(userName);

    if (!user) {
      res.status(400).json({
        error: `Could not find user with name ${userName}`
      });

      return;
    }

    const followers = await getFollowersForUserId(user.id);

    const publicUsers = followers.map((row) => serializePublicUser(row));

    res.json({
      users: publicUsers,
    });
  }));
}