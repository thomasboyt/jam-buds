import {Express} from 'express';
import wrapAsyncRoute from '../util/wrapAsyncRoute';

import {
  User,
  getUserByTwitterName,
  serializePublicUser,
} from '../models/user';

import {
  Song,
  getSongBySpotifyId,
  createSongFromSpotifyResource,
  createSongFromManualEntry,
} from '../models/song';

import {
  addSongToPlaylist,
  getPlaylistByUserId,
  getFeedByUserId,
} from '../models/playlist';

import {isAuthenticated} from '../auth';

import * as spotify from '../apis/spotify';
import {postSongTweet} from '../apis/twitter';

import {Playlist, Feed} from '../../universal/resources';

export default function registerPlaylistEndpoints(app: Express) {
  // post a new song to your playlist
  app.post('/playlist', isAuthenticated, wrapAsyncRoute(async (req, res) => {
    const user: User = res.locals.user;

    let song: Song;

    if (req.body.manualEntry) {
      song = await createSongFromManualEntry(req.body.artist, req.body.title);

    } else {
      const spotifyId = req.body.spotifyId;

      const maybeSong = await getSongBySpotifyId(spotifyId);

      if (!maybeSong) {
        const spotifyResource = await spotify.getTrackById(spotifyId);
        song = await createSongFromSpotifyResource(spotifyResource);

      } else {
        song = maybeSong;
      }
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
  }));

  // delete a song from your playlist
  app.delete('/playlist/:songId', isAuthenticated, wrapAsyncRoute(async (req, res) => {
    const user: User = res.locals.user;
    const songId: number = req.params.songId;

    // TODO: delete song by ID
  }));

  // get a user's playlist
  app.get('/playlists/:userName', wrapAsyncRoute(async (req, res) => {
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
  }));

  app.get('/feed', isAuthenticated, wrapAsyncRoute(async (req, res) => {
    const user: User = res.locals.user;

    const items = await getFeedByUserId(user.id);

    const feed: Feed = {
      tracks: items,
    };

    res.json(feed);
  }));
}