import {Router} from 'express';
import axios from 'axios';
import wrapAsyncRoute from '../util/wrapAsyncRoute';
import {AUTH_TOKEN_COOKIE} from '../../universal/constants';
import {getUserByAuthToken, serializeCurrentUser} from '../models/user';

// The manifest is cached here if in production mode, since it won't change!!
let manifest: any = null;
async function loadManifest(): Promise<any> {
  if (process.env.NODE_ENV === 'production' && manifest) {
    return manifest;
  }

  const url = `${process.env.STATIC_URL}/manifest.json`;
  const resp = await axios.get(url);
  manifest = resp.data;
  return manifest;
}

function scriptForChunk(manifest: any, name: string): string {
  const assets = manifest.assetsByChunkName[name];
  const filename = assets.find((asset: string) => asset.endsWith('.js'));
  return `<script src="${process.env.STATIC_URL}/${filename}"></script>`;
}

function styleForChunk(manifest: any, name: string): string {
  const assets = manifest.assetsByChunkName[name];
  const filename = assets.find((asset: string) => asset.endsWith('.css'));
  return `<link href="${process.env.STATIC_URL}/${filename}" rel="stylesheet" />`;
}

export default function registerPagesEndpoints(router: Router) {
  router.get('*', wrapAsyncRoute(async (req, res) => {
    const manifest = await loadManifest();

    const token = req.cookies[AUTH_TOKEN_COOKIE];

    let currentUser = null;

    if (token) {
      const user = await getUserByAuthToken(token);

      if (user) {
        currentUser = await serializeCurrentUser(user);
      }
    }

    const pageData = JSON.stringify({
      currentUser,
    });

    res.send(`
      <html>
        <head>
          <title>Jam Buds</title>
          <script src="https://www.youtube.com/iframe_api"></script>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          ${styleForChunk(manifest, 'app')}
        </head>

        <body>
          <div class="react-root"></div>
          <script>window.__PAGE_DATA__ = ${pageData}</script>
          ${scriptForChunk(manifest, 'vendor')}
          ${scriptForChunk(manifest, 'app')}
        </body>
      </html>
    `);
  }));
}
