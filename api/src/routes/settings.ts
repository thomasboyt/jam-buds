import { Router } from 'express';
import _ from 'lodash';
import { isAuthenticated } from '../auth';
import wrapAsyncRoute from '../util/wrapAsyncRoute';

import { setColorSchemeForUserId } from '../models/colorSchemes';
import { ColorScheme } from '../resources';
import {
  UserModel,
  setUserFeedToPublic,
  setUserFeedToPrivate,
} from '../models/user';
import {
  getButtondownSubscriptionId,
  subscribeToButtondownNewsletter,
  unsubscribeFromButtondownNewsletter,
} from '../apis/buttondown';

export default function registerSettingsEndpoints(router: Router) {
  router.get(
    '/settings/email-subscription',
    isAuthenticated,
    wrapAsyncRoute(async (req, res) => {
      const user: UserModel = res.locals.user;

      const subscribed = !!(await getButtondownSubscriptionId(user.email));

      res.json({
        subscribed,
      });
    })
  );

  router.post(
    '/settings/email-subscription',
    isAuthenticated,
    wrapAsyncRoute(async (req, res) => {
      const user: UserModel = res.locals.user;

      const buttondownId = await getButtondownSubscriptionId(user.email);
      if (!buttondownId) {
        await subscribeToButtondownNewsletter(user.email);
      }

      res.json({
        success: true,
      });
    })
  );

  router.delete(
    '/settings/email-subscription',
    isAuthenticated,
    wrapAsyncRoute(async (req, res) => {
      const user: UserModel = res.locals.user;

      const buttondownId = await getButtondownSubscriptionId(user.email);
      if (buttondownId) {
        await unsubscribeFromButtondownNewsletter(buttondownId);
      }

      res.json({
        success: true,
      });
    })
  );

  router.post(
    '/settings/color-scheme',
    isAuthenticated,
    wrapAsyncRoute(async (req, res) => {
      const user: UserModel = res.locals.user;

      const colorScheme = getColorSchemeFromBody(req.body);

      if (!colorScheme) {
        return res.status(400).json({
          error: 'Incorrect format for color scheme',
        });
      }

      await setColorSchemeForUserId(user.id, colorScheme);

      res.json({
        success: true,
      });
    })
  );

  // XXX: this is kinda silly but safe I guess
  router.post(
    '/settings/go-public',
    isAuthenticated,
    wrapAsyncRoute(async (req, res) => {
      const user: UserModel = res.locals.user;

      await setUserFeedToPublic(user);

      res.json({
        success: true,
      });
    })
  );

  router.post(
    '/settings/go-private',
    isAuthenticated,
    wrapAsyncRoute(async (req, res) => {
      const user: UserModel = res.locals.user;

      await setUserFeedToPrivate(user);

      res.json({
        success: true,
      });
    })
  );
}

function getColorSchemeFromBody(reqBody: any): ColorScheme | null {
  if (!reqBody) {
    return null;
  }

  const colorScheme = _.pick(reqBody, ['textColor', 'backgroundGradientName']);

  for (const key of Object.keys(colorScheme)) {
    // XXX: this is kinda weird but eh
    if (!(colorScheme as any)[key]) {
      return null;
    }
  }

  return colorScheme;
}
