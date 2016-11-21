import {Express} from 'express';
import {User, getUserByTwitterName} from '../models/user';

import {
  getSongBySpotifyId,
  createSongFromSpotifyResource,
} from '../models/song';

import {
  addSongToPlaylist,
  getPlaylistByUserId,
} from '../models/playlist';

import {
  getFollowingForUserId,
} from '../models/following';

import {getUserFromRequest, isAuthenticated} from '../auth';
import * as spotify from '../apis/spotify';

import {PublicUser, CurrentUser} from '../../universal/resources';

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

      const serializedUsers: PublicUser[] = followingUsers.map((user) => {
        return {
          id: user.id,
          twitterName: user.twitterName,
        };
      });

      const currentUser: CurrentUser = {
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
    });

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

    const playlist = await getPlaylistByUserId(user.id);

    res.send({
      playlist,
    });
  });

}