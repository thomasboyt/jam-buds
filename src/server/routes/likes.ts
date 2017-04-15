import {Router} from 'express';
import wrapAsyncRoute from '../util/wrapAsyncRoute';

import {
  User,
} from '../models/user';

import {
  likePlaylistEntry,
  unlikePlaylistEntry,
  getPlaylistEntryById,
} from '../models/playlist';

import {isAuthenticated} from '../auth';

export default function registerLikeEndpoints(router: Router) {
  // Like a song
  router.put('/likes/:entryId', isAuthenticated, wrapAsyncRoute(async (req, res) => {
    const entryId = req.params.entryId as number;
    const user = res.locals.user as User;

    const entry = await getPlaylistEntryById(entryId, {
      currentUserId: user.id,
    });

    if (!entry) {
      return res.status(404).json({
        error: `No song found with id ${entryId}`,
      });
    }

    if (entry.isLiked) {
      return res.status(400).json({
        error: 'Cannot like the same song twice',
      });
    }

    if (entry.user.id === user.id) {
      return res.status(400).json({
        error: 'Cannot like your own song',
      });
    }

    await likePlaylistEntry(user.id, entryId);

    res.json({
      success: true,
    });
  }));

  router.delete('/likes/:entryId', isAuthenticated, wrapAsyncRoute(async (req, res) => {
    const entryId = req.params.entryId as number;
    const user = res.locals.user as User;

    const entry = await getPlaylistEntryById(entryId, {
      currentUserId: user.id,
    });

    if (!entry) {
      return res.status(404).json({
        error: `No song found with id ${entryId}`,
      });
    }

    if (!entry.isLiked) {
      return res.status(400).json({
        error: 'Cannot unlike a song you don\'t like',
      });
    }

    await unlikePlaylistEntry(user.id, entryId);

    res.json({
      success: true,
    });
  }));
}