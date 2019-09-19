import { Router } from 'express';

import { isAuthenticated } from '../auth';
import wrapAsyncRoute from '../util/wrapAsyncRoute';
import { UserModel } from '../models/user';
import {
  getNewNotifications,
  markNotificationsAsRead,
} from '../models/notifications';

export default function registerNotificationsEndpoints(router: Router) {
  router.get(
    '/notifications',
    isAuthenticated,
    wrapAsyncRoute(async (req, res) => {
      const user = res.locals.user as UserModel;

      const notifications = await getNewNotifications(user.id);

      res.json(notifications);
    })
  );

  router.post(
    '/notifications/mark-all-read',
    isAuthenticated,
    wrapAsyncRoute(async (req, res) => {
      const user = res.locals.user as UserModel;

      await markNotificationsAsRead(user.id);

      res.json({ success: true });
    })
  );
}
