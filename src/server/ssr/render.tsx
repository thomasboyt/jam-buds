import {Router, Request, Response} from 'express';
import * as React from 'react';
import * as ReactDOMServer from 'react-dom/server';
import { match, RouterContext } from 'react-router'
import {Provider} from 'mobx-react';

import wrapAsyncRoute from '../util/wrapAsyncRoute';
import {AUTH_TOKEN_COOKIE} from '../../universal/constants';
import {CurrentUser} from '../../universal/resources';
import {getUserByAuthToken, serializeCurrentUser} from '../models/user';
import {getPlaylistEntryById} from '../models/playlist';

import Page from './Page';
import loadManifest from './loadManifest';
import {createRoutes, createStores} from '../../client/createApp';

export default async function renderApp(req: Request, res: Response, meta={}): Promise<string> {
  const manifest = await loadManifest();

  const token = req.cookies[AUTH_TOKEN_COOKIE];

  let currentUser: CurrentUser | null = null;

  if (token) {
    const user = await getUserByAuthToken(token);

    if (user) {
      currentUser = await serializeCurrentUser(user);
    }
  }

  const stores = createStores();
  if (currentUser) {
    stores.userStore.loadUser(currentUser)
  }
  const routes = createRoutes();

  return new Promise<string>((resolve, reject) => {
    match({ routes, location: req.url }, (error, redirectLocation, renderProps) => {
      if (error) {
        reject(error);

      } else if (renderProps) {
        const appHtml = ReactDOMServer.renderToString(
          <Provider {...stores}>
            <RouterContext {...renderProps} />
          </Provider>
        );

        const html = ReactDOMServer.renderToStaticMarkup(
          <Page pageData={{currentUser}} manifest={manifest} meta={{}} innerHtml={appHtml} />
        );

        resolve(html);

      } else {
        res.status(404).send('page not found');
        reject();
      }
    });
  });
}
