import { Router } from 'express';
import proxy from 'http-proxy-middleware';
import wrapAsyncRoute from '../util/wrapAsyncRoute';

import { UserModel } from '../models/user';

import { isAuthenticated } from '../auth';
import {
  getMixtapeById,
  addSongToMixtape,
  removeSongFromMixtape,
  reorderMixtapeSongs,
  setMixtapeTitle,
  publishMixtape,
  getDraftMixtapesByUserId,
} from '../models/mixtapes';
import { getOrCreateSong, hydrateSongMeta } from '../models/song';
import { Mixtape } from '../resources';
import { JamBudsHTTPError } from '../util/errors';
import config from '../config';
import { IncomingMessage } from 'http';
import { restream } from '../util/restream';

function validateMixtapeExists(mixtape: Mixtape | null): Mixtape {
  if (!mixtape) {
    throw new JamBudsHTTPError({
      statusCode: 404,
      message: `No mixtape found`,
    });
  }
  return mixtape;
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
  const target = config.require('JB_RHIANNON_URL');

  function filter(pathname: string, req: IncomingMessage) {
    return (
      (!!pathname.match('^/api/mixtapes/\\d+$') && req.method === 'GET') ||
      (!!pathname.match('^/api/mixtapes/\\d+$') && req.method === 'DELETE') ||
      (!!pathname.match('^/api/mixtapes$') && req.method === 'POST')
    );
  }

  router.use(
    '/mixtapes',
    proxy(filter, {
      target,
      onProxyReq: restream,
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

      const slug = await setMixtapeTitle({
        mixtapeId: mixtape.id,
        title: req.body.title,
      });

      res.json({ newSlug: slug });
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
