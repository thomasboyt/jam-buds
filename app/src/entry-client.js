import Vue from 'vue';
import createApp from './createApp';

import Cookies from 'js-cookie';

const AUTH_TOKEN_COOKIE = 'jamBudsAuthToken';

Vue.mixin({
  beforeRouteUpdate (to, from, next) {
    const { asyncData } = this.$options;

    if (asyncData) {
      asyncData({
        store: this.$store,
        route: to
      }).then(next).catch(next)
    } else {
      next()
    }
  }
})

const {app, router, store} = createApp();

// prime the store with server-initialized state.
// the state is determined during SSR and inlined in the page markup.
const initialState = window.__INITIAL_STATE__;
if (initialState) {
  store.replaceState(initialState)
}

const authToken = Cookies.get(AUTH_TOKEN_COOKIE);

if (authToken) {
  store.commit('setAuthToken', authToken);
}

// wait until router has resolved all async before hooks
// and async components...
router.onReady(() => {
  // Add router hook for handling asyncData.
  // Doing it after initial route is resolved so that we don't double-fetch
  // the data that we already have. Using router.beforeResolve() so that all
  // async components are resolved.
  router.beforeResolve((to, from, next) => {
    const matched = router.getMatchedComponents(to)
    const prevMatched = router.getMatchedComponents(from)
    let diffed = false
    const activated = matched.filter((c, i) => {
      return diffed || (diffed = (prevMatched[i] !== c))
    })
    const asyncDataHooks = activated.map(c => c.asyncData).filter(_ => _)
    if (!asyncDataHooks.length) {
      return next()
    }

    // TODO: Loading spinner starts and stops here apparently
    // bar.start()
    Promise.all(asyncDataHooks.map(hook => hook({ store, route: to })))
      .then(() => {
        // bar.finish()
        next()
      })
      .catch(next)
  })

  // actually mount to DOM
  app.$mount('#app')

  function setDevUser(name) {
    Cookies.set(AUTH_TOKEN_COOKIE, name);
    document.location.reload();
  }

  // global this for ease of debugging
  if (process.env.NODE_ENV !== 'production') {
    window.setDevUser = setDevUser;
  }
});
