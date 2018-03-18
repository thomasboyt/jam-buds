const playback = {
  namespaced: true,

  state() {
    return {
      isPlaying: false,
      nowPlaying: null,
      playbackSourceLabel: null,
      playbackSourcePath: null,
    };
  },

  mutations: {
    playSong(state, {entry, playbackSourceLabel, playbackSourcePath}) {
      // TODO: this could/should take ID instead of entry, and a getter would
      // look it up from the playlistEntries store
      // currently it's copying because I'm worried about a bunch of edge cases
      state.nowPlaying = entry;
      state.isPlaying = true;
      state.playbackSourceLabel = playbackSourceLabel;
      state.playbackSourcePath = playbackSourcePath;
    },

    togglePlayback(state) {
      state.isPlaying = !state.isPlaying;
    },

    clearPlayback(state) {
      state.nowPlaying = null;
      state.isPlaying = false;
      state.playbackSourceLabel = null;
      state.playbackSourcePath = null;
    }
  },

  actions: {
    playSong(context, payload) {
      context.commit('playSong', payload);
    },
    togglePlayback(context) {
      context.commit('togglePlayback');
    },
    clearPlayback(context) {
      context.commit('clearPlayback');
    },
  },
};

export default playback;