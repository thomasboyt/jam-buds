import { Router } from 'express';
import proxy from 'http-proxy-middleware';
import config from '../config';

import { UserModel } from '../models/user';
import { getOwnPostForSongId, deletePostById } from '../models/post';

import { isAuthenticated } from '../auth';
import wrapAsyncRoute from '../util/wrapAsyncRoute';
import { restream } from '../util/restream';

export default function registerPostEndpoints(router: Router) {
  const target = config.require('JB_RHIANNON_URL');
  router.use(/\/posts$/, proxy({ target, onProxyReq: restream }));

  // delete a post
  router.delete(
    '/posts/:songId',
    isAuthenticated,
    wrapAsyncRoute(async (req, res) => {
      const user: UserModel = res.locals.user;
      const songId: number = parseInt(req.params.songId, 10);

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
