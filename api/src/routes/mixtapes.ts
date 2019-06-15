import { Router } from 'express';
import wrapAsyncRoute from '../util/wrapAsyncRoute';

import { UserModel } from '../models/user';

import { isAuthenticated } from '../auth';
import {
  createMixtapeForUser,
  getMixtapeById,
  addSongToMixtape,
  removeSongFromMixtape,
} from '../models/mixtapes';
import { getOrCreateSong, serializeSong } from '../models/song';
import { Mixtape } from '../resources';
import { JamBudsHTTPError } from '../util/errors';

function validateMixtapeExists(mixtape: Mixtape | null): Mixtape {
  if (!mixtape) {
    throw new JamBudsHTTPError({
      statusCode: 404,
      message: `No mixtape found`,
    });
  }
  return mixtape;
}

function validateCanReadMixtape({
  mixtape,
  user,
}: {
  mixtape: Mixtape;
  user: UserModel;
}) {
  if (!mixtape.isPublished && mixtape.author.id !== user.id) {
    throw new JamBudsHTTPError({
      statusCode: 401,
      message: `You do not have access to this draft mixtape`,
    });
  }
}

function validateCanUpdateMixtape({
  mixtape,
  user,
}: {
  mixtape: Mixtape;
  user: UserModel;
}) {
  if (mixtape.author.id !== user.id) {
    throw new JamBudsHTTPError({
      statusCode: 401,
      message: `You do not own this mixtape`,
    });
  }

  if (mixtape.isPublished) {
    throw new JamBudsHTTPError({
      statusCode: 400,
      message: 'This mixtape is already published, and cannot be changed',
    });
  }
}

export default function registerMixtapeEndpoints(router: Router) {
  /**
   * Create a mixtape with a given initial title.
   */
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

  /**
   * Get a mixtape. Returns a 401 if it's a draft mixtape and you did not create
   * it.
   */
  router.get(
    '/mixtapes/:id',
    isAuthenticated,
    wrapAsyncRoute(async (req, res) => {
      const id: number = parseInt(req.params.id, 10);

      // TODO: don't require authentication here
      const user = res.locals.user as UserModel;

      let mixtape = await getMixtapeById(id, { currentUserId: user.id });
      mixtape = validateMixtapeExists(mixtape);
      validateCanReadMixtape({ mixtape, user });

      res.json(mixtape);
    })
  );

  router.post(
    '/mixtapes/:id/songs',
    isAuthenticated,
    wrapAsyncRoute(async (req, res) => {
      const user = res.locals.user as UserModel;
      let mixtape = await getMixtapeById(req.params.id, {
        currentUserId: user.id,
      });

      mixtape = validateMixtapeExists(mixtape);
      validateCanUpdateMixtape({ mixtape, user });

      const song = await getOrCreateSong(req.body.spotifyId);

      if (!song) {
        return res.status(400).json({
          error: `No song found with Spotify ID ${req.body.spotifyId}`,
        });
      }

      if (mixtape.tracks.find((mixtapeSong) => mixtapeSong.id === song.id)) {
        return res.status(400).json({
          error: 'Mixtape already contains this song',
        });
      }

      await addSongToMixtape(req.params.id, song.id);

      // HACK: liked display isn't shown for mixtapes so we can get away/ w just getting it with isLiked: false for now...
      res.json(serializeSong(song, false));
    })
  );

  router.delete(
    '/mixtapes/:mixtapeId/songs/:songId',
    isAuthenticated,
    wrapAsyncRoute(async (req, res) => {
      const user = res.locals.user as UserModel;
      let mixtape = await getMixtapeById(req.params.mixtapeId, {
        currentUserId: user.id,
      });

      mixtape = validateMixtapeExists(mixtape);
      validateCanUpdateMixtape({ mixtape, user });

      await removeSongFromMixtape({
        mixtapeId: mixtape.id,
        songId: req.params.songId,
      });

      res.json({ success: true });
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

  // Publish a mixtape owned by the current user
  // router.post(
  //   '/mixtapes/:id/publish',
  //   isAuthenticated,
  //   wrapAsyncRoute(async (req, res) => {
  //     const user = res.locals.user as UserModel;
  //   })
  // );

  // Rename a mixtape owned by the current user
  // router.post(
  //   '/mixtapes/:id/title',
  //   isAuthenticated,
  //   wrapAsyncRoute(async (req, res) => {
  //     const user = res.locals.user as UserModel;
  //   })
  // );
}
