import Vue from 'vue';
import Vuex from 'vuex';

import apiRequest from '../apiRequest';

Vue.use(Vuex);

import auth from './modules/auth';
import currentUser from './modules/currentUser';
import playlistEntries from './modules/playlistEntries';

const root = {
  modules: {
    auth,
    currentUser,
    playlistEntries,
  },

  state() {
    return {
      feedEntryIds: null,
      isSidebarOpen: false,
    }
  },

  mutations: {
    setFeed(state, feed) {
      state.feedEntryIds = feed.tracks.map((entry) => entry.id);
    },
    openSidebar(state) {
      state.isSidebarOpen = true;
    },
    closeSidebar(state) {
      state.isSidebarOpen = false;
    },
    deletePlaylistEntry(state, id) {
      const index = state.feedEntryIds.indexOf(id);

      if (index === -1) {
        return;
      }

      state.feedEntryIds = state.feedEntryIds.filter((val) => val !== id);
    }
  },

  actions: {
    async fetchFeed(context) {
      // context.commit('requestStart', 'feed');
      const feed = await apiRequest(context, {
        url: '/feed',
        method: 'GET',
        // params: {previousId},
      });

      context.commit('addPlaylistEntries', feed.data.tracks);
      context.commit('setFeed', feed.data);
    },
  },

  getters: {
    feedEntries(state, getters, rootState) {
      if (!state.feedEntryIds) {
        return null;
      }

      return state.feedEntryIds.map((id) => {
        return rootState.playlistEntries[id];
      });
    }
  }
}

export default function createStore() {
  return new Vuex.Store(root);
}