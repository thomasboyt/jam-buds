import Vue from 'vue';
import Vuex from 'vuex';

import apiRequest from '../apiRequest';

Vue.use(Vuex);

import auth from './modules/auth';
import currentUser from './modules/currentUser';

const root = {
  modules: {
    auth,
    currentUser,
  },

  state() {
    return {
      feed: null,
    }
  },

  mutations: {
    setFeed(state, feed) {
      state.feed = feed;
    },
  },

  actions: {
    async fetchFeed(context) {
      const feed = await apiRequest(context, {
        url: '/feed',
        method: 'GET',
        // params: {previousId},
      });

      context.commit('setFeed', feed.data);
    },
  }
}

export default function createStore() {
  return new Vuex.Store(root);
}