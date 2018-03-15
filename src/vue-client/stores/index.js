import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export default function createStore() {
  return new Vuex.Store({
    state: {
      // populated by /me lookup -> true/false
      authenticated: null,

      // populated by cookie, see entry-client/entry-server
      authToken: null,
    },

    mutations: {
      setAuthToken(state, token) {
        state.authToken = token;
      }
    }
  });
}