import { getOrCreatePlayer } from '../../players';

const playback = {
  namespaced: true,

  state() {
    return {
      player: null,

      isPlaying: false,
      isBuffering: false,

      /** Currently playing song ID*/
      currentSongId: null,

      playbackSourceLabel: null,
      playbackSourcePath: null,

      /** list of song IDs */
      queue: [],
    };
  },

  mutations: {
    setPlayer(state, player) {
      state.player = player;
    },

    playSong(state, { songId, playbackSourceLabel, playbackSourcePath }) {
      state.currentSongId = songId;
      state.isPlaying = true;
      state.playbackSourceLabel = playbackSourceLabel;
      state.playbackSourcePath = playbackSourcePath;
    },

    setQueue(state, songIds) {
      this.queue = [...songIds];
    },

    togglePlayback(state) {
      state.isPlaying = !state.isPlaying;
    },

    clearPlayback(state) {
      state.currentSongId = null;
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

      const song = context.getters.currentSong;
      playerInstance.setSong(song);
    },

    enqueueAndPlaySongs(
      context,
      { songIds, playbackSourceLabel, playbackSourcePath }
    ) {
      context.dispatch('playSong', {
        songId: songIds[0],
        playbackSourceLabel,
        playbackSourcePath,
      });

      context.commit('setQueue', songIds.slice(1));
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

  getters: {
    currentSong(state, getters, rootState) {
      return rootState.songs[state.currentSongId];
    },
  },
};

export default playback;
