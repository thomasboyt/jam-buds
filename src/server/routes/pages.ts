import {Router} from 'express';

import wrapAsyncRoute from '../util/wrapAsyncRoute';
import renderSinglePageApp from '../ssr/render';

export default function registerPagesEndpoints(router: Router) {
  router.get('*', wrapAsyncRoute(async (req, res) => {
    const html = await renderSinglePageApp(req, res);

    res.send(html);
  }));
}
