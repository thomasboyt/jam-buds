// TODO
//
// if (process.env.ENABLE_STACKDRIVER_TRACE) {
//   require('@google-cloud/trace-agent').start({
//     ignoreUrls: ['^/assets', '^/favicon.ico$', '^/robots.txt$'],
//   });
// }

import './src/util/loadDotEnv';

export default {
  mode: 'universal',

  srcDir: 'src/',

  features: {
    transitions: false,
  },

  server: {
    host: process.env.JB_APP_HOST || '0.0.0.0',
    port: process.env.JB_APP_PORT || 8080,
  },

  env: {
    NODE_ENV: process.env.NODE_ENV,
    DANGER_SKIP_AUTH: process.env.DANGER_SKIP_AUTH,
    DISABLE_APPLE_MUSIC: process.env.DISABLE_APPLE_MUSIC,
    STATIC_URL: process.env.JB_STATIC_URL,
  },

  /*
   ** Headers of the page
   */
  head: {
    titleTemplate: (title) => (title ? `${title} | Jam Buds` : 'Jam Buds'),
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },

      { name: 'twitter:card', content: 'summary' },
      { hid: 'title', name: 'og:title', content: 'jam buds!' },
      {
        hid: 'description',
        name: 'og:description',
        content: 'a place for sharing music with your friends!',
      },

      {
        name: 'og:image',
        content: `${process.env.JB_STATIC_URL}/corgi_icon_square.png`,
      },
    ],

    link: [
      {
        rel: 'icon',
        type: 'image/png',
        href: `${process.env.JB_STATIC_URL}/favicon16.png`,
        sizes: '16x16',
      },
      {
        rel: 'icon',
        type: 'image/png',
        href: `${process.env.JB_STATIC_URL}/favicon32.png`,
        sizes: '32x32',
      },
    ],
  },

  router: {
    extendRoutes(routes, resolve) {
      routes.push({
        name: 'mixtape-with-slug',
        path: '/mixtapes/:id/:slug',
        component: resolve(__dirname, 'src/pages/mixtapes/_id.vue'),
      });
    },
  },

  /*
   ** Customize the progress-bar color
   */
  loading: { color: 'hotpink' },
  /*
   ** Global CSS
   */
  css: ['normalize.css/normalize.css', '~/assets/styles/main.scss'],
  /*
   ** Plugins to load before mounting the App
   */
  plugins: ['~/plugins/axios', '~/plugins/spriteExtract', '~/plugins/logError'],
  /*
   ** Nuxt.js dev-modules
   */
  buildModules: ['~/modules/appleMusicTokenInject'],
  /*
   ** Nuxt.js modules
   */
  modules: [
    '@nuxtjs/sentry',
    '@nuxtjs/axios',
    '@nuxtjs/proxy',
    '~modules/spriteInject',
  ],

  sentry: {
    dsn: process.env.SENTRY_PUBLIC_DSN_APP,
  },

  axios: {
    proxy: true,
    // only used during server-side renders
    baseURL: `${process.env.JB_API_URL}/api`,
    // only used for client-side renders
    prefix: '/api/',
  },

  // proxy whines if it gets passed an undefined target so we only set it if the
  // variable is present (it's only needed for server builds but there doesn't
  // seem to be a way to only configure for server builds?)
  proxy: process.env.JB_API_URL
    ? {
        '/api': {
          target: process.env.JB_API_URL,
        },
        '/auth': {
          target: process.env.JB_API_URL,
        },
      }
    : undefined,

  /*
   ** Build configuration
   */
  build: {
    /*
     ** You can extend webpack config here
     */
    extend(config, { loaders }) {
      removeExistingSvgRule(config);

      config.module.rules.push({
        test: /assets\/(.*)\.svg$/,
        loader: 'svg-sprite-loader',
        options: {
          esModule: false,
        },
      });

      config.devtool = '#source-map';

      loaders.vue.compilerOptions = {
        whitespace: 'condense',
      };
    },
  },
};

// Borrowed from https://github.com/nuxt-community/svg-module/blob/master/lib/module.js
function removeExistingSvgRule(config) {
  const ORIGINAL_TEST = /\.(png|jpe?g|gif|svg|webp)$/;
  const REPLACEMENT_TEST = /\.(png|jpe?g|gif|webp)$/;

  const rules = config.module.rules;

  // Remove any original svg rules
  const svgRules = rules.filter((rule) => rule.test.test('.svg'));

  for (const rule of svgRules) {
    if (
      rule.test.source !== ORIGINAL_TEST.source &&
      rule.test.source !== REPLACEMENT_TEST.source
    ) {
      throw new Error(
        "nuxt-svg: Unexpected '.svg' rule in the webpack configuration"
      );
    }
    rule.test = REPLACEMENT_TEST;
  }
}
