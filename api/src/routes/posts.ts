import { Router } from 'express';

import { UserModel } from '../models/user';
import { getSongBySpotifyId, createSong } from '../models/song';
import {
  CreatePostParams,
  createPost,
  getPostById,
  deletePostById,
} from '../models/post';

import { isAuthenticated } from '../auth';
import wrapAsyncRoute from '../util/wrapAsyncRoute';
import { postSongTweet } from '../apis/twitter';
import { getOrCreateSongCacheEntryWithExternalIds } from '../util/songSearchCache';

export default function registerPostEndpoints(router: Router) {
  // post a new song
  router.post(
    '/posts',
    isAuthenticated,
    wrapAsyncRoute(async (req, res) => {
      const user: UserModel = res.locals.user;

      const spotifyId = req.body.spotifyId;

      // See if song has been submitted before
      //
      // TODO: This should "upsert" from the search cache, I think? Would
      // basically allow for 'refreshing' of song details in some cases. Would
      // still have to match on Spotify ID, though.
      let song = await getSongBySpotifyId(spotifyId);

      if (!song) {
        const searchCacheEntry = await getOrCreateSongCacheEntryWithExternalIds(
          req.body.spotifyId
        );

        if (!searchCacheEntry) {
          return res.status(400).send({
            error: `No track found for Spotify ID ${spotifyId}`,
          });
        }

        const spotifyResource = searchCacheEntry.spotify;

        const params = {
          spotifyId: spotifyResource.id,
          artists: spotifyResource.artists.map((artist) => artist.name),
          album: spotifyResource.album.name,
          title: spotifyResource.name,
          albumArt: spotifyResource.album.images[0].url,
          isrcId: searchCacheEntry.isrc,
          appleMusicId: searchCacheEntry.appleMusicId,
        };

        song = await createSong(params);
      }

      const params: CreatePostParams = {
        userId: user.id,
        songId: song.id,
      };

      const entry = await createPost(params);

      if (req.body.tweet) {
        await postSongTweet({
          text: req.body.tweet,
          user,
        });
      }

      res.json(entry);
    })
  );

  // delete a post
  router.delete(
    '/posts/:entryId',
    isAuthenticated,
    wrapAsyncRoute(async (req, res) => {
      const user: UserModel = res.locals.user;
      const entryId: number = req.params.entryId;

      const entry = await getPostById(entryId);

      if (!entry) {
        return res.status(404).json({
          error: `No song found with id ${entryId}`,
        });
      }

      if (entry.user.id !== user.id) {
        return res.status(400).json({
          error: "Cannot delete someone else's song",
        });
      }

      await deletePostById(entryId);

      res.json({
        success: true,
      });
    })
  );
}
