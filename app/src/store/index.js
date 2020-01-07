import Vuex from 'vuex';

import auth from './modules/auth';
import currentUser from './modules/currentUser';
import songs from './modules/songs';
import playback from './modules/playback';
import playlists from './modules/playlists';
import profile from './modules/profile';
import addSong from './modules/addSong';
import mixtapes from './modules/mixtapes';
import notifications from './modules/notifications';

const root = {
  modules: {
    auth,
    currentUser,
    songs,
    playback,
    playlists,
    profile,
    addSong,
    mixtapes,
    notifications,
  },

  state() {
    return {
      isSidebarOpen: false,
      mobileHeaderTitle: null,
    };
  },

  mutations: {
    openSidebar(state) {
      state.isSidebarOpen = true;
    },
    closeSidebar(state) {
      state.isSidebarOpen = false;
    },
    showErrorModal(state, errMsg) {
      const msg = errMsg || 'An unknown error occurred! Please try again.';
      // TODO: obviously there should be a better error modal
      alert(msg);
    },
    showMobileHeaderTitle(state, { title }) {
      state.mobileHeaderTitle = title;
    },
    hideMobileHeaderTitle(state) {
      state.mobileHeaderTitle = null;
    },
  },

  actions: {},

  getters: {
    getSongsForQueue(state, getters) {
      return (type, key) => {
        if (type === 'mixtape') {
          return getters.getMixtape(key).tracks;
        } else if (type === 'playlist') {
          return getters.playlistEntries(key);
        } else {
          throw new Error(`unrecognized object ${type}`);
        }
      };
    },
  },
};

export default function createStore() {
  return new Vuex.Store(root);
}
