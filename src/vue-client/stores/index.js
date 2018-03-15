import Vue from 'vue';
import Vuex from 'vuex';
import apiRequest from '../apiRequest';

Vue.use(Vuex);

export default function createStore() {
  return new Vuex.Store({
    state: {
      // populated by cookie, see entry-client/entry-server
      authToken: null,

      // populated by /me lookup
      authenticated: false,
      currentUser: null,

      feed: null,
    },

    mutations: {
      setAuthToken(state, token) {
        state.authToken = token;
      },
      setFeed(state, feed) {
        state.feed = feed;
      },
      setCurrentUser(state, user) {
        state.authenticated = true;
        state.user = user;
      }
    },

    actions: {
      async fetchCurrentUser(context) {
        if (!context.state.authToken) {
          return;
        }

        const resp = await apiRequest(context, {
          url: '/me',
          method: 'GET',
        });

        const user = resp.data.user;

        if (!user) {
          // TODO: auth token is bad so we should unset it here, I guess?
          return;
        }

        context.commit('setCurrentUser', user);
      },

      async fetchFeed(context) {
        const feed = await apiRequest(context, {
          url: '/feed',
          method: 'GET',
          // params: {previousId},
        });

        context.commit('setFeed', feed.data);
      },
    }
  });
}