import '~/assets/styles/main.scss';

import Vue from 'vue';
import Vuex from 'vuex';
import { sync } from 'vuex-router-sync';
import VueMq from 'vue-mq';
import Meta from 'vue-meta';

import App from './App.vue';
import createStore from './store';
import createRouter from './router';
import injectAxios from './util/injectAxios';

export default function createApp() {
  Vue.use(Vuex);

  Vue.use(VueMq, {
    breakpoints: {
      phone: 768,
      desktop: Infinity,
    },
    defaultBreakpoint: 'desktop',
  });

  Vue.use(Meta);

  const store = createStore();
  const router = createRouter();

  sync(store, router);

  const appConfig = {
    router,
    store,
    render: (h) => h(App),
  };

  injectAxios(appConfig);

  const app = new Vue(appConfig);
  return { app, router, store };
}
