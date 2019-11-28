import * as Sentry from '@sentry/browser';
import * as Integrations from '@sentry/integrations';
import Vue from 'vue';

if (process.env.SENTRY_PUBLIC_DSN_APP) {
  Sentry.init({
    dsn: process.env.SENTRY_PUBLIC_DSN_APP,
    integrations: [
      new Integrations.Vue({
        Vue,
        attachProps: true,
      }),
    ],
  });
}
