import { Router } from 'express';

import { UserModel } from '../models/user';
import { getOrCreateSong } from '../models/song';
import {
  PostSongParams,
  postSong,
  getOwnPostForSongId,
  deletePostById,
} from '../models/post';

import { isAuthenticated } from '../auth';
import wrapAsyncRoute from '../util/wrapAsyncRoute';
import { postSongTweet } from '../apis/twitter';

export default function registerPostEndpoints(router: Router) {
  // post a new song
  router.post(
    '/posts',
    isAuthenticated,
    wrapAsyncRoute(async (req, res) => {
      const user: UserModel = res.locals.user;

      const spotifyId = req.body.spotifyId;

      const song = await getOrCreateSong(spotifyId);

      if (!song) {
        return res
          .status(400)
          .json({ error: `No song found with Spotify ID ${spotifyId}` });
      }

      const existingPost = await getOwnPostForSongId({
        songId: song.id,
        userId: user.id,
      });

      if (existingPost) {
        return res
          .status(400)
          .json({ error: 'You have already posted this song' });
      }

      const params: PostSongParams = {
        userId: user.id,
        songId: song.id,
      };

      const entry = await postSong(params);

      if (req.body.tweet) {
        await postSongTweet({
          text: req.body.tweet,
          song,
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
