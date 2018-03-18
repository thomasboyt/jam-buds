import Vue from 'vue';
import Vuex from 'vuex';

import apiRequest from '../apiRequest';

Vue.use(Vuex);

import auth from './modules/auth';
import currentUser from './modules/currentUser';
import playlistEntries from './modules/playlistEntries';
import feed from './modules/feed';

const root = {
  modules: {
    auth,
    currentUser,
    playlistEntries,
    feed,
  },

  state() {
    return {
      isSidebarOpen: false,
    }
  },

  mutations: {
    openSidebar(state) {
      state.isSidebarOpen = true;
    },
    closeSidebar(state) {
      state.isSidebarOpen = false;
    },
  },

  actions: {
  },
}

export default function createStore() {
  return new Vuex.Store(root);
}