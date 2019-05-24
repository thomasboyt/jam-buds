import { Router } from 'express';

import { UserModel } from '../models/user';
import { getSongBySpotifyId, createSong } from '../models/song';
import {
  PostSongParams,
  postSong,
  getOwnPostForSongId,
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

      const params: PostSongParams = {
        userId: user.id,
        songId: song.id,
      };

      const entry = await postSong(params);

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
    '/posts/:songId',
    isAuthenticated,
    wrapAsyncRoute(async (req, res) => {
      const user: UserModel = res.locals.user;
      const songId: number = req.params.songId;

      const post = await getOwnPostForSongId({
        userId: user.id,
        songId,
      });

      if (!post) {
        return res.status(404).json({
          error: `No post found with song id ${songId} for this user`,
        });
      }

      await deletePostById(post.id);

      res.json({
        success: true,
      });
    })
  );
}
