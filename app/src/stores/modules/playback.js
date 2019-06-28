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

    setPlaybackSource(state, { playbackSourceLabel, playbackSourcePath }) {
      state.playbackSourceLabel = playbackSourceLabel;
      state.playbackSourcePath = playbackSourcePath;
    },

    playSong(state, { songId }) {
      state.currentSongId = songId;
      state.isPlaying = true;
    },

    setQueue(state, songIds) {
      state.queue = [...songIds];
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
    async playSong(context, { songId }) {
      const playerType = context.rootState.currentUser.hasSpotify
        ? 'spotify'
        : 'applemusic';

      context.commit('setPlayer', playerType);
      context.commit('playSong', { songId });

      const playerInstance = await getOrCreatePlayer(playerType, {
        store: this,
      });

      const song = context.getters.currentSong;
      playerInstance.setSong(song);
    },

    nextSong(context) {
      const [nextSong, ...queue] = context.state.queue;

      if (!nextSong) {
        // queue playback ended
        return;
      }

      context.dispatch('playSong', {
        songId: nextSong,
        playbackSourceLabel: context.state.playbackSourceLabel,
        playbackSourcePath: context.state.playbackSourcePath,
      });

      context.commit('setQueue', queue);
    },

    enqueueAndPlaySongs(
      context,
      { songIds, playbackSourceLabel, playbackSourcePath }
    ) {
      context.commit('setPlaybackSource', {
        playbackSourceLabel,
        playbackSourcePath,
      });

      context.commit('setQueue', songIds);
      context.dispatch('nextSong');
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
