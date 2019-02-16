import { Router } from 'express';

import { User } from '../models/user';
import {
  getSongBySpotifyId,
  createSongFromSpotifyResource,
} from '../models/song';
import {
  CreatePostParams,
  createPost,
  getPostById,
  deletePostById,
} from '../models/post';

import { isAuthenticated } from '../auth';
import wrapAsyncRoute from '../util/wrapAsyncRoute';
import { postSongTweet } from '../apis/twitter';
import * as spotify from '../apis/spotify';

export default function registerPostEndpoints(router: Router) {
  // post a new song
  router.post(
    '/posts',
    isAuthenticated,
    wrapAsyncRoute(async (req, res) => {
      const user: User = res.locals.user;

      const spotifyId = req.body.spotifyId;

      let song = await getSongBySpotifyId(spotifyId);

      if (!song) {
        const spotifyResource = await spotify.getTrackById(spotifyId);
        song = await createSongFromSpotifyResource(spotifyResource);
      }

      const params: CreatePostParams = {
        userId: user.id,
        songId: song.id,
        note: req.body.note,
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
      const user: User = res.locals.user;
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
