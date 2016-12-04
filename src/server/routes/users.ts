import {Express} from 'express';
import {
  User,
  getUserByTwitterName,
  getUserByUserId,
} from '../models/user';

import {
  getSongBySpotifyId,
  createSongFromSpotifyResource,
} from '../models/song';

import {
  addSongToPlaylist,
  getPlaylistByUserId,
  getFeedByUserId,
} from '../models/playlist';

import {
  followUser,
  getFollowingForUserId,
} from '../models/following';

import {getUserFromRequest, isAuthenticated} from '../auth';
import * as spotify from '../apis/spotify';
import {postSongTweet} from '../apis/twitter';

import {PublicUser, CurrentUser, Playlist, Feed} from '../../universal/resources';

function serializePublicUser(user: User): PublicUser {
  return {
    id: user.id,
    twitterName: user.twitterName,
  };
}

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

  // post a new song to your playlist
  app.post('/playlist', isAuthenticated, async (req, res) => {
    const user: User = res.locals.user;
    const spotifyId = req.body.spotifyId;

    let song = await getSongBySpotifyId(spotifyId);

    if (!song) {
      const spotifyResource = await spotify.getTrackById(spotifyId);
      song = await createSongFromSpotifyResource(spotifyResource);
    }

    await addSongToPlaylist({
      userId: user.id,
      songId: song.id,
      youtubeUrl: req.body.youtubeUrl,
      note: req.body.note,
    });

    if (req.body.tweet) {
      await postSongTweet({
        text: req.body.tweet,
        user,
      });
    }

    res.json({
      success: true,
    });
  });

  // delete a song from your playlist
  app.delete('/playlist/:songId', isAuthenticated, async (req, res) => {
    const user: User = res.locals.user;
    const songId: number = req.params.songId;

    // TODO: delete song by ID
  });

  // get a user's playlist
  app.get('/playlists/:userName', async (req, res) => {
    const userName = req.params.userName;
    const user = await getUserByTwitterName(userName);

    if (!user) {
      res.status(404).json({
        error: `No user found with name ${userName}`
      });

      return;
    }

    const tracks = await getPlaylistByUserId(user.id);

    const serializedUser = serializePublicUser(user);

    const resp: Playlist = {
      user: serializedUser,
      tracks,
    };

    res.json(resp);
  });

  app.get('/feed', isAuthenticated, async (req, res) => {
    const user: User = res.locals.user;

    const items = await getFeedByUserId(user.id);

    const feed: Feed = {
      tracks: items,
    };

    res.json(feed);
  });

}