import {Express} from 'express';
import wrapAsyncRoute from '../util/wrapAsyncRoute';
import * as _ from 'lodash';

import {
  User,
  getUserByTwitterName,
  serializePublicUser,
  getUnfollowedUsersByTwitterIds,
  getColorSchemeForUserId,
  getUserProfileForUser,
  setColorSchemeForUserId,
} from '../models/user';

import {
  followUser,
  unfollowUser,
  getFollowingForUserId,
  getFollowersForUserId,
} from '../models/following';

import {getUserFromRequest, isAuthenticated} from '../auth';
import {getTwitterFriendIds} from '../apis/twitter';

import {PublicUser, CurrentUser, Playlist, Feed, Followers, Following, ColorScheme} from '../../universal/resources';

export default function registerUserEndpoints(app: Express) {

  // get information about the current user
  app.get('/me', wrapAsyncRoute(async (req, res) => {
    const user = await getUserFromRequest(req);

    if (!user) {
      return res.json({
        user: null,
      });
    }

    const colorScheme = await getColorSchemeForUserId(user.id);

    const followingUsers = await getFollowingForUserId(user.id);

    const serializedUsers: PublicUser[] = followingUsers.map(serializePublicUser);

    const currentUser: CurrentUser = {
      id: user.id,
      name: user.twitterName,
      following: serializedUsers,
      colorScheme,
    };

    res.json({
      user: currentUser,
    });
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

  app.get('/users/:userName/following', wrapAsyncRoute(async (req, res) => {
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

    const resp: Following = {
      userProfile: await getUserProfileForUser(user),
      users: publicUsers,
    };

    res.json(resp);
  }));

  app.get('/users/:userName/followers', wrapAsyncRoute(async (req, res) => {
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

    const resp: Followers = {
      userProfile: await getUserProfileForUser(user),
      users: publicUsers,
    };

    res.json(resp);
  }));

  app.post('/settings/color-scheme', isAuthenticated, wrapAsyncRoute(async (req, res) => {
    const user: User = res.locals.user;

    const colorScheme = getColorSchemeFromBody(req.body);

    if (!colorScheme) {
      return res.status(400).json({
        error: 'Incorrect format for color scheme',
      });
    }

    await setColorSchemeForUserId(user.id, colorScheme);

    res.json({
      success: true,
    });
  }));
}

function getColorSchemeFromBody(reqBody: any): ColorScheme | null {
  if (!reqBody) {
    return null;
  }

  const required = [
    'backgroundColor',
    'textColor',
    'linkColor',
    'entryBackgroundColor',
    'entryTextColor',
    'entryLinkColor',
  ];

  for (let key of required) {
    if (!reqBody[key]) {
      return null;
    }
  }

  return _.pick(reqBody, required) as ColorScheme;
}