import { getOrCreatePlayer } from '../../players';

const playback = {
  namespaced: true,

  state() {
    return {
      isPlaying: false,
      isBuffering: false,
      nowPlaying: null,
      playbackSourceLabel: null,
      playbackSourcePath: null,
      player: null,
    };
  },

  mutations: {
    setPlayer(state, player) {
      state.player = player;
    },

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

    sync(state, syncState) {
      for (let key of Object.keys(syncState)) {
        state[key] = syncState[key];
      }
    },
  },

  actions: {
    async playSong(context, payload) {
      const player = context.rootState.currentUser.hasSpotify
        ? 'spotify'
        : 'applemusic';

      context.commit('setPlayer', player);
      context.commit('playSong', payload);

      const playerInstance = await getOrCreatePlayer(player, {
        store: this,
      });

      playerInstance.setSong(payload.song);
    },

    async togglePlayback(context) {
      const playerInstance = await getOrCreatePlayer(context.state.player, {
        store: this,
      });

      if (context.state.isPlaying) {
        playerInstance.pause();
      } else {
        playerInstance.play();
      }
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
