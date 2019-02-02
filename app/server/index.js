const express = require('express');
const cookieParser = require('cookie-parser');
const proxy = require('http-proxy-middleware');
const { createBundleRenderer } = require('vue-server-renderer');
const Raven = require('raven');
const { renderTemplate, templates } = require('./templates');

const AUTH_TOKEN_COOKIE = 'jamBudsAuthToken';

const app = express();

const isProd = process.env.NODE_ENV === 'production';

if (isProd) {
  Raven.config(process.env.SENTRY_DSN_APP).install();
  app.use(Raven.requestHandler());
}

function createRenderer(bundle, clientManifest) {
  return createBundleRenderer(bundle, {
    // recommended for performance
    runInNewContext: false,
    clientManifest,
    template: templates['index'],
  });
}

async function main() {
  let renderer;
  let readyPromise;
  let buildErrors;

  if (isProd) {
    // In production: create server renderer using template and built server bundle.
    // The server bundle is generated by vue-ssr-webpack-plugin.
    const serverBundle = require('../build/vue-ssr-server-bundle.json');

    // The client manifests are optional, but it allows the renderer
    // to automatically infer preload/prefetch links and directly add <script>
    // tags for any async chunks used during render, avoiding waterfall requests.
    const clientManifest = require('../build/vue-ssr-client-manifest.json');

    renderer = createRenderer(serverBundle, clientManifest);
  } else {
    // In development: setup the dev server with watch and hot-reload,
    // and create a new renderer on bundle / index template update.

    // XXX: Defer loading dev server module so various dependencies aren't
    // required in production
    const setupDevServer = require('./devServer');
    setupDevServer(app, {
      onStart: (promise) => {
        readyPromise = promise;
        buildErrors = null;
      },
      onComplete: (bundle, clientManifest) => {
        renderer = createRenderer(bundle, clientManifest);
      },
      onError: (errors) => {
        buildErrors = errors;
      },
    });
  }

  function renderWebpackError(req, res, buildErrors) {
    res.status(500);
    res.send(renderTemplate('webpack-error', { buildErrors }));
  }

  function renderAppError(req, res, err) {
    if (err.url) {
      res.redirect(err.url);
    } else if (
      err.code === 404 ||
      (err.response && err.response.status === 404)
    ) {
      res.status(404);

      res.send(renderTemplate('404'));
    } else {
      // Render Error Page or Redirect
      res.status(500);

      if (!isProd) {
        res.send(renderTemplate('500-dev', { stack: err.stack }));
      } else {
        res.send(renderTemplate('500'));
      }

      console.error(`error during render : ${req.url}`);
      console.error(err.stack);
    }
  }

  function render(req, res) {
    const authToken = req.cookies[AUTH_TOKEN_COOKIE];

    const context = {
      url: req.url,
      authToken,
      title: 'Jam Buds',
      staticUrl: process.env.STATIC_URL,
    };

    renderer.renderToString(context, (err, html) => {
      if (err) {
        return renderAppError(req, res, err, context);
      }
      res.send(html);
    });
  }

  if (isProd) {
    app.use(
      '/assets',
      express.static('build/', {
        // this is pretty arbitrary because these are all sha-stamped and should never be updated
        // cloudfront doesn't support Cache-Control: immutable tho...
        maxAge: '1 year',
      })
    );

    app.use(
      '/assets',
      express.static('static/', {
        // TODO: so, currently, these assets aren't sha-stamped, and I don't have a way to invalidate
        // cloudfront in my deploy process
        // once invalidation is added this should have a maxAge block
        // https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/Invalidation.html
      })
    );
  } else {
    app.use('/assets', express.static('static/'));
  }

  app.use(cookieParser());

  app.use(
    '/auth',
    proxy({
      target: process.env.API_URL,
      changeOrigin: true,
      cookieDomainRewrite: process.env.APP_URL,
    })
  );

  app.get('*', (req, res) => {
    if (isProd) {
      return render(req, res);
    } else {
      if (buildErrors) {
        renderWebpackError(req, res, buildErrors);
      } else {
        readyPromise.then(() => render(req, res));
      }
    }
  });

  if (isProd) {
    app.use(Raven.errorHandler());
  }

  const port = process.env.PORT || 8080;

  app.listen(port, () => {
    console.log(`server started on port ${port}`);
  });
}

main();
