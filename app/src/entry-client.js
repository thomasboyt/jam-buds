import './configureSentry';

import createApp from './createApp';
import Vue from 'vue';

import ProgressBar from './components/ProgressBar.vue';
const bar = new Vue(ProgressBar).$mount();
Vue.prototype.$bar = bar; // inject into Vue instance so components can update progress
document.body.appendChild(bar.$el);

import Cookies from 'js-cookie';
const AUTH_TOKEN_COOKIE = 'jamBudsAuthToken';

Vue.mixin({
  /**
   * This hook is run when a component is reused but the route params change,
   * e.g. when you go from e.g. /users/vinny -> /users/jeff
   */
  beforeRouteUpdate(to, from, next) {
    const { asyncData, shouldFetchOnUpdate } = this.$options;

    // Allow components to define a shouldFetchOnUpdate() hook to determine
    // whether or not to re-run fetching. This should e.g. check to see if a
    // relevant param has changed
    const allowUpdateFetch = shouldFetchOnUpdate
      ? shouldFetchOnUpdate(to, from)
      : true;

    if (asyncData && allowUpdateFetch) {
      asyncData({
        store: this.$store,
        route: to,
      })
        .then(next)
        .catch(next);
    } else {
      next();
    }
  },
});

const { app, router, store } = createApp();

// prime the store with server-initialized state.
// the state is determined during SSR and inlined in the page markup.
const initialState = window.__INITIAL_STATE__;
if (initialState) {
  store.replaceState(initialState);
}

const authToken = Cookies.get(AUTH_TOKEN_COOKIE);
app.$axios.defaults.headers = {
  'X-Auth-Token': authToken,
};

// wait until router has resolved all async before hooks
// and async components...
router.onReady(() => {
  // Add router hook for handling asyncData.
  // Doing it after initial route is resolved so that we don't double-fetch
  // the data that we already have. Using router.beforeResolve() so that all
  // async components are resolved.
  router.beforeResolve((to, from, next) => {
    const matched = router.getMatchedComponents(to);
    const prevMatched = router.getMatchedComponents(from);
    let diffed = false;
    const activated = matched.filter((c, i) => {
      return diffed || (diffed = prevMatched[i] !== c);
    });
    const asyncDataHooks = activated.map((c) => c.asyncData).filter((_) => _);
    if (!asyncDataHooks.length) {
      return next();
    }

    bar.start();
    Promise.all(asyncDataHooks.map((hook) => hook({ store, route: to })))
      .then(() => {
        bar.finish();
        next();
      })
      .catch(next);
  });

  // actually mount to DOM
  app.$mount('#app');

  function setDevUser(name) {
    Cookies.set(AUTH_TOKEN_COOKIE, name);
    document.location.reload();
  }

  // global this for ease of debugging
  if (process.env.NODE_ENV !== 'production') {
    window.setDevUser = setDevUser;
  }
});
