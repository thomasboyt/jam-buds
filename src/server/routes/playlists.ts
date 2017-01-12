import {Express} from 'express';
import wrapAsyncRoute from '../util/wrapAsyncRoute';

import {
  User,
  getUserByTwitterName,
  serializePublicUser,
  getUserProfileForUser,
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
  getLikedEntriesByUserId,
  getFeedByUserId,
  getPlaylistEntryById,
  deletePlaylistEntryById,
} from '../models/playlist';

import {getUserFromRequest, isAuthenticated} from '../auth';

import * as spotify from '../apis/spotify';
import * as bandcamp from '../apis/bandcamp';
import {postSongTweet} from '../apis/twitter';

import {Playlist, Feed, PlaybackSource} from '../../universal/resources';

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

    if (!req.body.bandcampTrackId && !req.body.youtubeUrl) {
      return res.status(400).json({
        error: 'No playback source given',
      });
    }

    const source: PlaybackSource = req.body.source;

    let params = {
      source,
      userId: user.id,
      songId: song.id,
      note: req.body.note,
      youtubeUrl: req.body.youtubeUrl,
    };

    if (source === 'bandcamp') {
      const bandcampTrackId = req.body.bandcampTrackId;

      params = {
        bandcampTrackId,
        bandcampStreamingUrl: await bandcamp.getBandcampStreamingUrl(bandcampTrackId),
        bandcampUrl: req.body.bandcampUrl,
        ...params,
      };

    } else if (source === 'youtube') {
      params = {
        youtubeUrl: req.body.youtubeUrl,
        ...params
      };
    }

    const entry = await addSongToPlaylist(params);

    if (req.body.tweet) {
      await postSongTweet({
        text: req.body.tweet,
        user,
      });
    }

    res.json(entry);
  }));

  // delete a song from your playlist
  app.delete('/playlist/:entryId', isAuthenticated, wrapAsyncRoute(async (req, res) => {
    const user: User = res.locals.user;
    const entryId: number = req.params.entryId;

    // TODO: delete song by ID
    const entry = await getPlaylistEntryById(entryId)

    if (!entry) {
      return res.status(404).json({
        error: `No song found with id ${entryId}`,
      });
    }

    if (entry.user.id !== user.id) {
      return res.status(400).json({
        error: 'Cannot delete someone else\'s song',
      });
    }

    await deletePlaylistEntryById(entryId);

    res.json({
      success: true,
    });
  }));

  // get a user's playlist
  app.get('/playlists/:userName', wrapAsyncRoute(async (req, res) => {
    const userName = req.params.userName;
    const user = await getUserByTwitterName(userName);
    const currentUser = await getUserFromRequest(req);

    if (!user) {
      res.status(404).json({
        error: `No user found with name ${userName}`
      });

      return;
    }

    const previousId = req.query.previousId && parseInt(req.query.previousId, 10);

    const tracks = await getPlaylistByUserId(user.id, {
      currentUserId: currentUser ? currentUser.id : undefined,
      previousId,
    });

    const resp: Playlist = {
      userProfile: await getUserProfileForUser(user),
      tracks,
    };

    res.json(resp);
  }));

  app.get('/playlists/:userName/liked', wrapAsyncRoute(async (req, res) => {
    const userName = req.params.userName;
    const user = await getUserByTwitterName(userName);
    const currentUser = await getUserFromRequest(req);

    if (!user) {
      res.status(404).json({
        error: `No user found with name ${userName}`
      });

      return;
    }

    const previousId = req.query.previousId && parseInt(req.query.previousId, 10);

    const tracks = await getLikedEntriesByUserId(user.id, {
      currentUserId: currentUser ? currentUser.id : undefined,
      previousId,
    });

    const resp: Playlist = {
      userProfile: await getUserProfileForUser(user),
      tracks,
    };

    res.json(resp);
  }));

  app.get('/feed', isAuthenticated, wrapAsyncRoute(async (req, res) => {
    const user: User = res.locals.user;

    const previousId = req.query.previousId && parseInt(req.query.previousId, 10);

    const items = await getFeedByUserId(user.id, {
      currentUserId: user.id,
      previousId,
    });

    const feed: Feed = {
      tracks: items,
    };

    res.json(feed);
  }));
}