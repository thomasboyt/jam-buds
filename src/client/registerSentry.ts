const Raven = require('raven-js');

if (process.env.NODE_ENV === 'production') {
  Raven
    .config(process.env.SENTRY_PUBLIC_DSN)  // see Webpack configuration!
    .install();
}