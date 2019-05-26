import { Router } from 'express';
import _ from 'lodash';
import { isAuthenticated } from '../auth';
import wrapAsyncRoute from '../util/wrapAsyncRoute';

import { setColorSchemeForUserId } from '../models/colorSchemes';
import { ColorScheme } from '../resources';
import { UserModel } from '../models/user';

export default function registerSettingsEndpoints(router: Router) {
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
}

function getColorSchemeFromBody(reqBody: any): ColorScheme | null {
  if (!reqBody) {
    return null;
  }

  const colorScheme = _.pick(reqBody, ['textColor', 'backgroundGradientName']);

  for (let key of Object.keys(colorScheme)) {
    // XXX: this is kinda weird but eh
    if (!(colorScheme as any)[key]) {
      return null;
    }
  }

  return colorScheme;
}
