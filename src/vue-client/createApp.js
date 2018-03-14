import Vue from 'vue';
import {sync} from 'vuex-router-sync';

import App from './App.vue';
import createStore from './stores';
import createRouter from './router';

export default function createApp() {
  const store = createStore();
  const router = createRouter();

  sync(store, router);

  const app = new Vue({
    router,
    store,
    render: (h) => h(App)
  });

  return {app, router, store};
}