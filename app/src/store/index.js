import Vuex from 'vuex';
import { parse as parseCookie } from 'cookie';
import { parse as parseUrl } from 'url';

import auth from './modules/auth';
import currentUser from './modules/currentUser';
import songs from './modules/songs';
import playback from './modules/playback';
import playlists from './modules/playlists';
import profile from './modules/profile';
import addSong from './modules/addSong';
import mixtapes from './modules/mixtapes';
import notifications from './modules/notifications';
import streaming from './modules/streaming';

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
    streaming,
  },

  state() {
    return {
      isWebView: false,
      isSidebarOpen: false,
      mobileHeaderTitle: null,
      flashMessage: null,
      isConnectStreamingBannerOpen: false,
      activeBottomTab: '/',
    };
  },

  mutations: {
    enableWebView(state) {
      state.isWebView = true;
    },
    setActiveTab(state, path) {
      state.activeBottomTab = path;
    },
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
    setFlashMessage(state, { message, timeoutHandle }) {
      state.flashMessage = message;
      state.timeoutHandle = timeoutHandle;
    },
    clearFlashMessage(state) {
      state.flashMessage = null;
      state.timeoutHandle = null;
    },
    showConnectStreamingBanner(state) {
      state.isConnectStreamingBannerOpen = true;
    },
    hideConnectStreamingBanner(state) {
      state.isConnectStreamingBannerOpen = false;
    },
  },

  actions: {
    async nuxtServerInit(context, { req, query }) {
      const cookie = parseCookie(req.headers.cookie || '');
      const authToken = cookie.jamBudsAuthToken;

      if (authToken) {
        this.$axios.defaults.headers = {
          'X-Auth-Token': authToken,
        };
        this.commit('setAuthToken', authToken);
      }

      await context.dispatch('fetchCurrentUser');

      // TODO: maybe pull this out of nuxtServerInit?
      if ('webview' in query) {
        context.commit('enableWebView');
      }

      const pathname = parseUrl(req.url).pathname;
      if (context.state.auth.authenticated) {
        const currentProfile = `/users/${context.state.currentUser?.name}`;
        if (pathname.startsWith(currentProfile)) {
          context.commit('setActiveTab', currentProfile);
          return;
        }
      }
      context.commit('setActiveTab', pathname);
    },

    setFlashMessage(state, { message, clearMs = 3000 }) {
      if (state.timeoutHandle) {
        clearTimeout(state.timeoutHandle);
      }

      const timeoutHandle = setTimeout(() => {
        this.commit('clearFlashMessage');
      }, clearMs);

      this.commit('setFlashMessage', { message, timeoutHandle });
    },

    clearFlashMessage(state) {
      if (state.timeoutHandle) {
        clearTimeout(state.timeoutHandle);
      }

      this.commit('clearFlashMessage');
    },
  },

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
