import { Router } from 'express';
import wrapAsyncRoute from '../util/wrapAsyncRoute';

import {
  UserModel,
  getUserByName,
  getUserProfileForUser,
} from '../models/user';

import { isAuthenticated, getUserFromRequest } from '../auth';
import {
  createMixtapeForUser,
  getMixtapeById,
  addSongToMixtape,
  removeSongFromMixtape,
  reorderMixtapeSongs,
  setMixtapeTitle,
  publishMixtape,
  getDraftMixtapeIdForUserId,
  deleteMixtape,
  getPublishedMixtapesByUserId,
  getDraftMixtapesByUserId,
} from '../models/mixtapes';
import { getOrCreateSong, hydrateSongMeta } from '../models/song';
import { Mixtape, UserPostList } from '../resources';
import { JamBudsHTTPError } from '../util/errors';
import { ENTRY_PAGE_LIMIT } from '../constants';

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
  user: UserModel | null;
}) {
  if (!mixtape.isPublished) {
    if (!(user && mixtape.author.id === user.id)) {
      throw new JamBudsHTTPError({
        statusCode: 401,
        message: `You do not have access to this draft mixtape`,
      });
    }
  }
}

function validateCanDeleteMixtape({
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

      // XXX: Return existing draft mixtape if one already exists. This will
      // probably go away or change once the mixtape list is implemented!
      const existingId = await getDraftMixtapeIdForUserId(user.id);

      if (existingId) {
        return res.json({
          mixtapeId: existingId,
        });
      }

      const id = await createMixtapeForUser(user, { title });

      res.json({
        mixtapeId: id,
      });
    })
  );

  /**
   * Get a mixtape. Returns a 401 if it's a draft mixtape and you did not create
   * it.
   */
  router.get(
    '/mixtapes/:mixtapeId',
    wrapAsyncRoute(async (req, res) => {
      const mixtapeId = parseInt(req.params.mixtapeId, 10);
      const currentUser = await getUserFromRequest(req);

      let mixtape = await getMixtapeById(mixtapeId, {
        currentUserId: currentUser ? currentUser.id : undefined,
      });

      mixtape = validateMixtapeExists(mixtape);
      validateCanReadMixtape({ mixtape, user: currentUser });

      res.json(mixtape);
    })
  );

  router.delete(
    '/mixtapes/:mixtapeId',
    isAuthenticated,
    wrapAsyncRoute(async (req, res) => {
      const user = res.locals.user as UserModel;
      const mixtapeId = parseInt(req.params.mixtapeId, 10);
      let mixtape = await getMixtapeById(mixtapeId, {
        currentUserId: user.id,
      });

      mixtape = validateMixtapeExists(mixtape);
      validateCanDeleteMixtape({ mixtape, user });

      await deleteMixtape(mixtape.id);

      res.json({ success: true });
    })
  );

  router.post(
    '/mixtapes/:mixtapeId/songs',
    isAuthenticated,
    wrapAsyncRoute(async (req, res) => {
      const user = res.locals.user as UserModel;
      const mixtapeId = parseInt(req.params.mixtapeId, 10);
      let mixtape = await getMixtapeById(mixtapeId, {
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

      await addSongToMixtape(mixtapeId, song.id);
      const songResource = await hydrateSongMeta(song, {
        currentUserId: user.id,
      });

      res.json(songResource);
    })
  );

  router.delete(
    '/mixtapes/:mixtapeId/songs/:songId',
    isAuthenticated,
    wrapAsyncRoute(async (req, res) => {
      const user = res.locals.user as UserModel;
      const mixtapeId = parseInt(req.params.mixtapeId, 10);
      const songId = parseInt(req.params.songId, 10);
      let mixtape = await getMixtapeById(mixtapeId, {
        currentUserId: user.id,
      });

      mixtape = validateMixtapeExists(mixtape);
      validateCanUpdateMixtape({ mixtape, user });

      await removeSongFromMixtape({
        mixtapeId: mixtape.id,
        songId,
      });

      res.json({ success: true });
    })
  );

  router.post(
    '/mixtapes/:mixtapeId/order',
    isAuthenticated,
    wrapAsyncRoute(async (req, res) => {
      const user = res.locals.user as UserModel;
      const mixtapeId = parseInt(req.params.mixtapeId, 10);
      let mixtape = await getMixtapeById(mixtapeId, {
        currentUserId: user.id,
      });

      mixtape = validateMixtapeExists(mixtape);
      validateCanUpdateMixtape({ mixtape, user });

      // TODO: validate the fuck outta this!!
      const songOrder = req.body.songOrder;

      await reorderMixtapeSongs({
        mixtapeId: mixtape.id,
        songOrder,
      });

      res.json({ success: true });
    })
  );

  // Publish a mixtape owned by the current user
  router.post(
    '/mixtapes/:mixtapeId/publish',
    isAuthenticated,
    wrapAsyncRoute(async (req, res) => {
      const user = res.locals.user as UserModel;
      const mixtapeId = parseInt(req.params.mixtapeId, 10);

      let mixtape = await getMixtapeById(mixtapeId, {
        currentUserId: user.id,
      });

      mixtape = validateMixtapeExists(mixtape);
      validateCanUpdateMixtape({ mixtape, user });

      await publishMixtape(mixtape.id);

      res.json({ success: true });
    })
  );

  // Rename a mixtape owned by the current user
  router.post(
    '/mixtapes/:mixtapeId/title',
    isAuthenticated,
    wrapAsyncRoute(async (req, res) => {
      const user = res.locals.user as UserModel;
      const mixtapeId = parseInt(req.params.mixtapeId, 10);
      let mixtape = await getMixtapeById(mixtapeId, {
        currentUserId: user.id,
      });

      mixtape = validateMixtapeExists(mixtape);
      validateCanUpdateMixtape({ mixtape, user });

      await setMixtapeTitle({ mixtapeId: mixtape.id, title: req.body.title });

      res.json({ succes: true });
    })
  );

  // Get mixtapes for a specific user
  router.get(
    '/users/:userName/mixtapes',
    wrapAsyncRoute(async (req, res) => {
      const userName = req.params.userName;
      const user = await getUserByName(userName);
      const currentUser = await getUserFromRequest(req);

      if (!user) {
        res.status(400).json({
          error: `Could not find user with name ${userName}`,
        });

        return;
      }

      const beforeTimestamp = req.query.before;
      const afterTimestamp = req.query.after;

      const items = await getPublishedMixtapesByUserId(user.id, {
        currentUserId: currentUser ? currentUser.id : undefined,
        beforeTimestamp,
        afterTimestamp,
      });

      const resp: UserPostList = {
        userProfile: await getUserProfileForUser(user),
        items,
        limit: ENTRY_PAGE_LIMIT,
      };

      res.json(resp);
    })
  );

  // Get draft mixtapes for the current user
  router.get(
    '/draft-mixtapes',
    isAuthenticated,
    wrapAsyncRoute(async (req, res) => {
      const user = res.locals.user as UserModel;

      const mixtapesList = await getDraftMixtapesByUserId(user.id);

      res.json(mixtapesList);
    })
  );
}
