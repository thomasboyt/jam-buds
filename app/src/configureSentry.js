import * as Sentry from '@sentry/browser';
import Vue from 'vue';

if (process.env.SENTRY_PUBLIC_DSN_APP) {
  Sentry.init({
    dsn: process.env.SENTRY_PUBLIC_DSN_APP,
    integrations: [
      new Sentry.Integrations.Vue({
        Vue,
        attachProps: true,
      }),
    ],
  });
}
