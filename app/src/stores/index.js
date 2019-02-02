import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

import auth from './modules/auth';
import currentUser from './modules/currentUser';
import playlistEntries from './modules/playlistEntries';
import playback from './modules/playback';
import playlists from './modules/playlists';
import profile from './modules/profile';
import addSong from './modules/addSong';

const root = {
  modules: {
    auth,
    currentUser,
    playlistEntries,
    playback,
    playlists,
    profile,
    addSong,
  },

  state() {
    return {
      isSidebarOpen: false,
    };
  },

  mutations: {
    openSidebar(state) {
      state.isSidebarOpen = true;
    },
    closeSidebar(state) {
      state.isSidebarOpen = false;
    },
  },

  actions: {},
};

export default function createStore() {
  return new Vuex.Store(root);
}
