import Vue from 'vue';
import { sync } from 'vuex-router-sync';

import App from './App.vue';
import createStore from './stores';
import createRouter from './router';
import injectAxios from './util/injectAxios';

import '../styles/main.scss';

export default function createApp() {
  const store = createStore();
  const router = createRouter();

  sync(store, router);

  const appConfig = {
    router,
    store,
    render: (h) => h(App),
  };

  injectAxios(appConfig, store);

  const app = new Vue(appConfig);
  return { app, router, store };
}
