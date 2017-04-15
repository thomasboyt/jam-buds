import {Router} from 'express';
import axios from 'axios';
import wrapAsyncRoute from '../util/wrapAsyncRoute';

async function loadManifest(): Promise<any> {
  // TODO: cache manifest here if in production mode, since it won't change!!
  const url = `${process.env.STATIC_URL}/manifest.json`;
  const resp = await axios.get(url);
  return resp.data;
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
          ${scriptForChunk(manifest, 'vendor')}
          ${scriptForChunk(manifest, 'app')}
        </body>
      </html>
    `);
  }));
}
