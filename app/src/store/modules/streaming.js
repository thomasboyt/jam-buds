const streaming = {
  state() {
    return {
      hasSpotify: false,
      loadedSpotify: false,
      hasAppleMusic: false,
      loadedAppleMusic: false,
    };
  },

  mutations: {
    loadedSpotify(state, isAuthorized) {
      state.hasSpotify = isAuthorized;
      state.loadedSpotify = true;
    },
    removeSpotify(state) {
      state.hasSpotify = false;
    },
    loadedAppleMusic(state, isAuthorized) {
      state.hasAppleMusic = isAuthorized;
      state.loadedAppleMusic = true;
    },
    removedAppleMusic(state) {
      state.hasAppleMusic = false;
    },
  },

  actions: {
    async checkSpotifyConnection(context) {
      const resp = await this.$axios({
        url: '/spotify-token',
        method: 'GET',
      });
      context.commit('loadedSpotify', !!resp.data.token);
    },
  },

  getters: {
    loadedStreaming(state) {
      // XXX: short circuits so both don't actually have to finish loading for truthy values
      if (state.hasAppleMusic) {
        return true;
      }
      if (state.hasSpotify) {
        return true;
      }
      return state.loadedAppleMusic && state.loadedSpotify;
    },
  },
};

export default streaming;
