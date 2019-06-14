import { Router } from 'express';
import wrapAsyncRoute from '../util/wrapAsyncRoute';

import { UserModel } from '../models/user';

import { isAuthenticated } from '../auth';
import { createMixtapeForUser, getMixtapeById } from '../models/mixtapes';

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

  // Delete a mixtape owned by the current user
  // router.delete(
  //   '/mixtapes/:id',
  //   isAuthenticated,
  //   wrapAsyncRoute(async (req, res) => {
  //     const user = res.locals.user as UserModel;
  //   })
  // );
}
