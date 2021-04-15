import { mutationTree, getterTree, actionTree } from 'typed-vuex';
import { getStreamingSupport } from '~/util/streamingSupport';

type StreamingService = 'spotify' | 'appleMusic' | 'youtube';

interface StreamingState {
  service: StreamingService | null;
  webPlayerEnabled: boolean;
  musicKitToken: string | null;
  supports: {
    spotify: boolean;
    appleMusic: boolean;
  };
}

export const state = (): StreamingState => {
  return {
    service: null,
    webPlayerEnabled: false,
    musicKitToken: null,
    supports: {
      spotify: false,
      appleMusic: false,
    },
  };
};

export const getters = getterTree(state, {
  /**
   * Returns whether the music player is enabled for this combo of service +
   * platform (whether web or native).
   */
  playerEnabled(state) {
    if (state.service === 'spotify') {
      return state.supports.spotify;
    } else if (state.service === 'appleMusic') {
      return state.supports.appleMusic;
    } else {
      return false;
    }
  },

  streamingServiceName(state) {
    if (state.service === 'spotify') {
      return 'Spotify';
    } else if (state.service === 'appleMusic') {
      return 'Apple Music';
    }
    return state.service;
  },
});

export const mutations = mutationTree(state, {
  enableWebPlayer(state) {
    state.webPlayerEnabled = true;
  },
  setMusicKitToken(state, token: string) {
    state.musicKitToken = token;
  },
  setStreamingSupport(
    state,
    { spotify, appleMusic }: { spotify: boolean; appleMusic: boolean }
  ) {
    state.supports.spotify = spotify;
    state.supports.appleMusic = appleMusic;
  },
  setStreamingService(state, serviceName: StreamingService | null) {
    state.service = serviceName;
  },
});

export const actions = actionTree(
  { state, getters, mutations },
  {
    initializeStreaming(context, { userAgent }: { userAgent: string }): void {
      const isWebView = context.rootState.isWebView;
      if (!isWebView) {
        context.commit('enableWebPlayer');
      }

      context.commit('setStreamingSupport', {
        spotify: getStreamingSupport('spotify', userAgent, isWebView),
        appleMusic: getStreamingSupport('appleMusic', userAgent, isWebView),
      });

      const service = localStorage.getItem('streamingService');
      if (
        service === 'youtube' ||
        service === 'spotify' ||
        service === 'appleMusic'
      ) {
        context.commit('setStreamingService', service);
      }
    },

    updateStreamingService(context, serviceName: StreamingService) {
      localStorage.setItem('streamingService', serviceName);
      context.commit('setStreamingService', serviceName);
    },

    updateSessionStreamingService(context, serviceName: StreamingService) {
      context.commit('setStreamingService', serviceName);
    },

    unsetStreamingService(context) {
      localStorage.removeItem('streamingService');
      context.commit('setStreamingService', null);
    },

    async checkSpotifyConnection(context) {
      const resp = await this.$axios({
        url: '/spotify-token',
        method: 'GET',
      });
      // if we're no longer authorized, disable
      if (!resp.data.spotifyConnected) {
        context.dispatch('unsetStreamingService');
      }
    },
  }
);
