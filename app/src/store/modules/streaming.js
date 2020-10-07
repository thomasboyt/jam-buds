import { getStreamingSupport } from '~/util/streamingSupport';

const streaming = {
  state() {
    return {
      service: null,
      webPlayerEnabled: false,
      musicKitToken: null,
      supports: {
        spotify: false,
        appleMusic: false,
      },
    };
  },

  mutations: {
    enableWebPlayer(state) {
      state.webPlayerEnabled = true;
    },
    setMusicKitToken(state, token) {
      state.musicKitToken = token;
    },
    setStreamingSupport(state, { spotify, appleMusic }) {
      state.supports.spotify = spotify;
      state.supports.appleMusic = appleMusic;
    },
    setStreamingService(state, serviceName) {
      state.service = serviceName;
    },
  },

  actions: {
    initializeStreaming(context, { userAgent }) {
      const isWebView = context.rootState.isWebView;
      if (!isWebView) {
        context.commit('enableWebPlayer');
      }

      context.commit('setStreamingSupport', {
        spotify: getStreamingSupport('spotify', userAgent, isWebView),
        appleMusic: getStreamingSupport('appleMusic', userAgent, isWebView),
      });

      const service = localStorage.getItem('streamingService');
      if (service) {
        context.commit('setStreamingService', service);
      }
    },

    updateStreamingService(context, serviceName) {
      localStorage.setItem('streamingService', serviceName);
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
  },

  getters: {
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
  },
};

export default streaming;
