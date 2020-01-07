process.on('unhandledRejection', (err) => {
  console.error('\n*** Unhandled rejection:');
  console.error(err);
});

if (process.env.ENABLE_STACKDRIVER_TRACE) {
  require('@google-cloud/trace-agent').start({
    ignoreUrls: ['^/assets', '^/favicon.ico$', '^/robots.txt$'],
  });
}

const express = require('express');
const cookieParser = require('cookie-parser');
const proxy = require('http-proxy-middleware');
const { createBundleRenderer } = require('vue-server-renderer');
const { renderTemplate, templates } = require('./templates');
const Sentry = require('@sentry/node');

const AUTH_TOKEN_COOKIE = 'jamBudsAuthToken';

const app = express();

const isProd = process.env.NODE_ENV === 'production';
const useDevServer = !(isProd || process.env.CI);
const useSentry = process.env.SENTRY_PUBLIC_DSN_APP;

if (useSentry) {
  Sentry.init({
    dsn: process.env.SENTRY_PUBLIC_DSN_APP,
  });

  app.use(Sentry.Handlers.requestHandler());
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

  if (useDevServer) {
    // In development: setup the dev server with watch and hot-reload, and
    // create a new renderer on bundle / index template update.

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
  } else {
    // In production: create server renderer using template and built server
    // bundle. The server bundle is generated by vue-ssr-webpack-plugin.
    const serverBundle = require('../build/vue-ssr-server-bundle.json');

    // The client manifests are optional, but it allows the renderer to
    // automatically infer preload/prefetch links and directly add <script> tags
    // for any async chunks used during render, avoiding waterfall requests.
    const clientManifest = require('../build/vue-ssr-client-manifest.json');

    renderer = createRenderer(serverBundle, clientManifest);
  }

  function renderWebpackError(req, res, buildErrors) {
    res.status(500);
    res.send(renderTemplate('webpack-error', { buildErrors }));
  }

  /**
   * Application errors currently do _not_ bring the server down, but instead
   * result in a user-facing error message and a Sentry report.
   */
  function renderAppError(req, res, err) {
    console.error(`\n *** Error during render : ${req.url}`);

    if (err.url) {
      res.redirect(err.url);
    } else if (
      err.code === 404 ||
      (err.response && err.response.status === 404)
    ) {
      // - Route just straight-up doesn't exist
      // - Upstream 404 errors in asyncData()
      res.status(404);

      res.send(renderTemplate('404'));
    } else {
      // - Server-side rendering errors
      // - asyncData errors
      //   - Upstream 500 errors
      //   - ECONNREFUSED errors (API server is unreachable)
      res.status(500);

      if (!isProd) {
        res.send(renderTemplate('500-dev', { stack: err.stack }));
      } else {
        res.send(renderTemplate('500'));
      }

      // rethrow so it's caught and sent off to the express sentry middleware
      throw err;
    }
  }

  function render(req, res) {
    const authToken = req.cookies[AUTH_TOKEN_COOKIE];

    const context = {
      url: req.url,
      authToken,
      title: 'Jam Buds',
      staticUrl: process.env.STATIC_URL,
      apiUrl: process.env.API_URL,
      productionScripts: isProd ? templates['production-scripts'] : '',
    };

    return new Promise((resolve, reject) => {
      renderer.renderToString(context, (err, html) => {
        if (err) {
          try {
            renderAppError(req, res, err, context);
          } catch (err) {
            reject(err);
          }
        }
        res.send(html);
        resolve();
      });
    });
  }

  if (useDevServer) {
    app.use('/assets', express.static('src/static/'));
  } else {
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
      express.static('src/static/', {
        // TODO: so, currently, these assets aren't sha-stamped, and I don't have a way to invalidate
        // cloudfront in my deploy process
        // once invalidation is added this should have a maxAge block
        // https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/Invalidation.html
      })
    );
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

  app.use(
    '/api',
    proxy({
      target: process.env.API_URL,
    })
  );

  app.get('*', (req, res, next) => {
    if (useDevServer) {
      if (buildErrors) {
        renderWebpackError(req, res, buildErrors);
      } else {
        readyPromise
          .then(() => render(req, res))
          .catch((err) => {
            next(err);
          });
      }
    } else {
      return render(req, res);
    }
  });

  if (useSentry) {
    app.use(Sentry.Handlers.errorHandler());
  }

  const port = process.env.PORT || 8080;

  app.listen(port, () => {
    console.log(`server started on port ${port}`);
  });
}

main();
