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
    playSong(state, { song, playbackSourceLabel, playbackSourcePath }) {
      // XXX: Eventually, this should take _entry ID_ instead of a song, for
      // playlist-playback purposes
      // (could also take song-and-playlist and find entry from playlist)
      state.nowPlaying = song;
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
    },

    sync(state, { isPaused }) {
      state.isPlaying = !isPaused;
    },
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
    sync(context, payload) {
      context.commit('sync', payload);
    },
  },
};

export default playback;
