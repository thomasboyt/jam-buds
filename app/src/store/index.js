import { parse as parseCookie } from 'cookie';
// eslint-disable-next-line node/no-deprecated-api
import { parse as parseUrl } from 'url';

export const state = () => {
  return {
    isWebView: false,
    mobileHeaderTitle: null,
    flashMessage: null,
    activeBottomTab: '/',
  };
};

export const mutations = {
  enableWebView(state) {
    state.isWebView = true;
  },
  setActiveTab(state, path) {
    state.activeBottomTab = path;
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
};

export const actions = {
  async nuxtServerInit(context, { req, query }) {
    const cookie = parseCookie(req.headers.cookie || '');
    const authToken = cookie.jamBudsAuthToken;

    if (authToken) {
      this.$axios.defaults.headers = {
        'X-Auth-Token': authToken,
      };
      this.commit('auth/setAuthToken', authToken);
    }

    await context.dispatch('auth/fetchCurrentUser');

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
      if (pathname.startsWith('/settings')) {
        context.commit('setActiveTab', '/settings');
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
};

export const getters = {
  getSongsForQueue(state, getters) {
    return (type, key) => {
      if (type === 'mixtape') {
        return getters['mixtapes/getMixtape'](key).tracks;
      } else if (type === 'playlist') {
        return getters.playlistEntries(key);
      } else {
        throw new Error(`unrecognized object ${type}`);
      }
    };
  },
};
