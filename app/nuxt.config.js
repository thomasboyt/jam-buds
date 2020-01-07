import dotenv from 'dotenv';

if (process.env.NODE_ENV !== 'production') {
  if (!process.env.CI) {
    if (process.env.NODE_ENV === 'test') {
      dotenv.config({
        path: '../.env.test',
      });
    } else {
      dotenv.config({
        path: '../.env',
      });
    }
  }
}

export default {
  mode: 'universal',

  srcDir: 'src/',

  server: {
    port: 8080,
  },

  env: {
    NODE_ENV: process.env.NODE_ENV,
    DANGER_SKIP_AUTH: process.env.DANGER_SKIP_AUTH,
    DISABLE_APPLE_MUSIC: process.env.DISABLE_APPLE_MUSIC,
    STATIC_URL: process.env.STATIC_URL,
  },

  /*
   ** Headers of the page
   */
  head: {
    title: 'Jam Buds',
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
        content: `${process.env.STATIC_URL}/corgi_icon_square.png`,
      },
    ],

    link: [
      {
        rel: 'icon',
        type: 'image/png',
        href: `${process.env.STATIC_URL}/favicon16.png`,
        sizes: '16x16',
      },
      {
        rel: 'icon',
        type: 'image/png',
        href: `${process.env.STATIC_URL}/favicon32.png`,
        sizes: '32x32',
      },
    ],
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
  plugins: ['~/plugins/axios'],
  /*
   ** Nuxt.js dev-modules
   */
  buildModules: [],
  /*
   ** Nuxt.js modules
   */
  modules: [
    '@nuxtjs/axios',
    // '@nuxtjs/dotenv',
    '@nuxtjs/proxy',
  ],
  /*
   ** Axios module configuration
   ** See https://axios.nuxtjs.org/options
   */
  axios: {
    proxy: true,
    baseURL: `${process.env.API_URL_NUXT}/api`,
    prefix: '/api/',
  },

  proxy: {
    '/api': {
      target: process.env.API_URL_NUXT,
    },
    '/auth': {
      target: process.env.API_URL_NUXT,
    },
  },

  /*
   ** Build configuration
   */
  build: {
    /*
     ** You can extend webpack config here
     */
    // extend(config, ctx) {},
  },
};
