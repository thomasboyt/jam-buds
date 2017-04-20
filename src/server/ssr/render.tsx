import {Router, Request, Response} from 'express';
import * as React from 'react';
import * as ReactDOMServer from 'react-dom/server';
import { match, RouterContext } from 'react-router'
import {Provider} from 'mobx-react';
import {serialize, deserialize} from 'serializr';

import wrapAsyncRoute from '../util/wrapAsyncRoute';
import {AUTH_TOKEN_COOKIE} from '../../universal/constants';
import {CurrentUser} from '../../universal/resources';
import {User, getUserByAuthToken, serializeCurrentUser} from '../models/user';
import {getPlaylistEntryById} from '../models/playlist';

import Page from './Page';
import loadManifest from './loadManifest';
import {createRoutes, createStores} from '../../client/createApp';

import axios from 'axios';
axios.defaults.baseURL = `http://localhost:${process.env.PORT || 3000}`;

export default async function renderApp(req: Request, res: Response, meta={}): Promise<string> {
  const manifest = await loadManifest();

  const token = req.cookies[AUTH_TOKEN_COOKIE];

  let currentUser: User | null = null;
  let serializedCurrentUser: CurrentUser | null = null;

  if (token) {
    currentUser = await getUserByAuthToken(token);
    if (currentUser) {
      serializedCurrentUser = await serializeCurrentUser(currentUser);
    }
  }

  const stores = createStores();
  if (serializedCurrentUser) {
    stores.userStore.loadUser(serializedCurrentUser)
  }
  const routes = createRoutes();

  // const serializedData = JSON.stringify(stores);

  return new Promise<string>((resolve, reject) => {
    match({ routes, location: req.url }, async (error, redirectLocation, renderProps) => {
      if (error) {
        reject(error);

      } else if (renderProps) {
        const fetchFns = renderProps.routes.map((route) => route.fetchData).filter((fn) => !!fn);

        for (let fetchFn of fetchFns) {
          // TODO:
          // This could potentially lead to race conditions where the wrong token is used, I think
          // this would be very bad, obviously.
          axios.interceptors.request.use((config) => {
            if (currentUser) {
              config.headers['X-Auth-Token'] = currentUser.authToken;
            }
            return config;
          });

          await fetchFn(stores);
        }

        const appHtml = ReactDOMServer.renderToString(
          <Provider {...stores}>
            <RouterContext {...renderProps} />
          </Provider>
        );

        const html = ReactDOMServer.renderToStaticMarkup(
          <Page pageData={stores}
            manifest={manifest} meta={{}} innerHtml={appHtml} />
        );

        resolve(html);

      } else {
        res.status(404).send('page not found');
        reject();
      }
    });
  });
}
