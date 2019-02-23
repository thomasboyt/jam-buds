import { Router } from 'express';
import wrapAsyncRoute from '../util/wrapAsyncRoute';

import { UserModel } from '../models/user';
import { createLike, removeLike, likeExists } from '../models/like';
import { getSongById } from '../models/song';

import { isAuthenticated } from '../auth';

export default function registerLikesEndpoints(router: Router) {
  // Like a song
  router.put(
    '/likes/:songId',
    isAuthenticated,
    wrapAsyncRoute(async (req, res) => {
      const songId = req.params.songId as number;
      const user = res.locals.user as UserModel;

      const song = await getSongById(songId);

      if (!song) {
        return res.status(404).json({
          error: `No song found with id ${songId}`,
        });
      }

      await createLike({ userId: user.id, songId: song.id });

      res.json({
        success: true,
      });
    })
  );

  router.delete(
    '/likes/:songId',
    isAuthenticated,
    wrapAsyncRoute(async (req, res) => {
      const songId = req.params.songId as number;
      const user = res.locals.user as UserModel;

      const song = await getSongById(songId);

      if (!song) {
        return res.status(404).json({
          error: `No song found with id ${songId}`,
        });
      }

      const likeParams = { songId: song.id, userId: user.id };

      if (!(await likeExists(likeParams))) {
        return res.status(400).json({
          error: "Cannot unlike a song you don't like",
        });
      }

      await removeLike(likeParams);

      res.json({
        success: true,
      });
    })
  );
}
