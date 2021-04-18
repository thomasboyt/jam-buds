import { getAccessorType, mutationTree, actionTree } from 'typed-vuex';
import { parse as parseCookie } from 'cookie';
// eslint-disable-next-line node/no-deprecated-api
import { parse as parseUrl } from 'url';

import * as auth from './auth';
import * as colorScheme from './colorScheme';
import * as currentUser from './currentUser';
import * as mixtapes from './mixtapes';
import * as notifications from './notifications';
import * as playback from './playback';
import * as playlist from './playlist';
import * as playlistItems from './playlistItems';
import * as profile from './profile';
import * as streaming from './streaming';

interface RootState {
  isWebView: boolean;
  mobileHeaderTitle: string | null;
  flashMessage: string | null;
  activeBottomTab: string;
  timeoutHandle: number | null;
}

export const state = (): RootState => {
  return {
    isWebView: false,
    mobileHeaderTitle: null,
    flashMessage: null,
    activeBottomTab: '/',
    timeoutHandle: null,
  };
};

export const mutations = mutationTree(state, {
  enableWebView(state) {
    state.isWebView = true;
  },
  setActiveTab(state, path: string) {
    state.activeBottomTab = path;
  },
  showErrorModal(state, errMsg?: string | null) {
    const msg = errMsg || 'An unknown error occurred! Please try again.';
    // TODO: obviously there should be a better error modal
    alert(msg);
  },
  showMobileHeaderTitle(state, { title }: { title: string }) {
    state.mobileHeaderTitle = title;
  },
  hideMobileHeaderTitle(state) {
    state.mobileHeaderTitle = null;
  },
  _setFlashMessage(
    state,
    { message, timeoutHandle }: { message: string; timeoutHandle: number }
  ) {
    state.flashMessage = message;
    state.timeoutHandle = timeoutHandle;
  },
  _clearFlashMessage(state) {
    state.flashMessage = null;
    state.timeoutHandle = null;
  },
});

export const actions = actionTree(
  { state, mutations },
  {
    // TODO: type args of this
    async nuxtServerInit(
      context,
      { req, query }: { req: any; query: any }
    ): Promise<void> {
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

      const pathname = parseUrl(req.url).pathname!;
      if (this.app.$accessor.auth.authenticated) {
        const currentProfile = `/users/${
          this.app.$accessor.currentUser.user!.name
        }`;
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

    setFlashMessage(
      { state },
      { message, clearMs = 3000 }: { message: string; clearMs?: number }
    ): void {
      if (state.timeoutHandle) {
        clearTimeout(state.timeoutHandle);
      }

      const timeoutHandle = setTimeout(() => {
        this.commit('clearFlashMessage');
      }, clearMs);

      this.commit('_setFlashMessage', { message, timeoutHandle });
    },

    clearFlashMessage({ state }): void {
      if (state.timeoutHandle) {
        clearTimeout(state.timeoutHandle);
      }

      this.commit('_clearFlashMessage');
    },
  }
);

export const accessorType = getAccessorType({
  state,
  mutations,
  actions,
  modules: {
    auth,
    currentUser,
    colorScheme,
    mixtapes,
    notifications,
    playback,
    playlist,
    playlistItems,
    profile,
    streaming,
  },
});
