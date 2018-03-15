import Vue from 'vue';
import Vuex from 'vuex';
import apiRequest from '../apiRequest';

Vue.use(Vuex);

export default function createStore() {
  return new Vuex.Store({
    state: {
      // populated by /me lookup -> true/false
      authenticated: null,

      // populated by cookie, see entry-client/entry-server
      authToken: null,

      feed: null,
    },

    mutations: {
      setAuthToken(state, token) {
        state.authToken = token;
      },
      fetchedCurrentUser(state, user) {
        state.authenticated = true;
      },
      setFeed(state, feed) {
        state.feed = feed;
      },
    },

    actions: {
      fetchCurrentUser(context) {
        /*
         * TODO: Unstub this duh~~~
         */

        const token = context.state.authToken;

        return new Promise((resolve, reject) => {
          if (!token) {
            console.log('no token present')
            return resolve();
          }

          setTimeout(() => {
            const fakeUser = {};
            context.commit('fetchedCurrentUser', fakeUser);
            resolve();
          }, 50);
        });
      },

      async fetchFeed(context) {
        const feed = await apiRequest(context, {
          url: '/feed',
          method: 'GET',
          // params: {previousId},
        });

        console.log(feed.data);

        context.commit('setFeed', feed.data);
      },
    }
  });
}