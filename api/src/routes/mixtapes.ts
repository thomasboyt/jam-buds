import { Router } from 'express';
import wrapAsyncRoute from '../util/wrapAsyncRoute';

import { UserModel } from '../models/user';

import { isAuthenticated } from '../auth';
import {
  createMixtapeForUser,
  getMixtapeById,
  addSongToMixtape,
  userOwnsMixtape,
  mixtapeHasSong,
} from '../models/mixtapes';
import { getOrCreateSong, serializeSong } from '../models/song';

export default function registerMixtapeEndpoints(router: Router) {
  // Create a mixtape
  router.post(
    '/mixtapes',
    isAuthenticated,
    wrapAsyncRoute(async (req, res) => {
      const user = res.locals.user as UserModel;

      // TODO: validate
      const title = req.body.title;

      await createMixtapeForUser(user, { title });

      res.json({
        success: true,
      });
    })
  );

  router.get(
    '/mixtapes/:id',
    isAuthenticated,
    wrapAsyncRoute(async (req, res) => {
      const id: number = parseInt(req.params.id, 10);

      // TODO: don't require authentication here
      const user = res.locals.user as UserModel;
      const mixtape = await getMixtapeById(id, { currentUserId: user.id });

      if (!mixtape) {
        return res.status(404).json({
          error: `No mixtape found with id ${id}`,
        });
      }

      res.json(mixtape);
    })
  );

  router.post(
    '/mixtapes/:id/songs',
    isAuthenticated,
    wrapAsyncRoute(async (req, res) => {
      const user = res.locals.user as UserModel;
      const mixtapeId = req.params.id;

      if (!(await userOwnsMixtape(user.id, mixtapeId))) {
        return res.status(401).json({
          error: 'You do not own this mixtape',
        });
      }

      const song = await getOrCreateSong(req.body.spotifyId);

      if (!song) {
        return res.status(400).json({
          error: `No song found with Spotify ID ${req.body.spotifyId}`,
        });
      }

      if (await mixtapeHasSong({ mixtapeId, songId: song.id })) {
        return res.status(400).json({
          error: 'Mixtape already contains this song',
        });
      }

      await addSongToMixtape(req.params.id, song.id);

      // HACK: liked display isn't shown for mixtapes so we can get away/ w just getting it with isLiked: false for now...
      res.json(serializeSong(song, false));
    })
  );

  // Delete a mixtape owned by the current user
  // router.delete(
  //   '/mixtapes/:id',
  //   isAuthenticated,
  //   wrapAsyncRoute(async (req, res) => {
  //     const user = res.locals.user as UserModel;
  //   })
  // );
}
