import {Express} from 'express';
import {User, getUserByTwitterName} from '../models/user';

import {
  getSongBySpotifyId,
  createSongFromSpotifyResource,
  addSongToPlaylist
} from '../models/song';

import {getUserFromRequest, isAuthenticated} from '../auth';
import * as spotify from '../apis/spotify';

export default function registerUserEndpoints(app: Express) {

  // get information about the current user
  app.get('/users/me', async (req, res) => {
    const user = await getUserFromRequest(req);

    if (!user) {
      res.json({
        user: null,
      });

    } else {
      res.json({
        user: {
          name: user.twitterName,
          // TODO: probably put a friends list here
        },
      });
    }
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

    await addSongToPlaylist(user.id, song.id);

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
    const user = getUserByTwitterName(userName);

    if (!user) {
      res.status(404).json({
        error: `No user found with name ${userName}`
      });

      return;
    }
    // TODO: get user's playlist
  });

}