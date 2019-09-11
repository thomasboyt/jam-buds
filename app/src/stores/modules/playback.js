import { getOrCreatePlayer } from '../../players';
// const nextEntry = getNextSongEntry(playlist, entryIdx);

// This takes advantage of playlist being ordered
const getNextSongEntry = (playlist, prevSongTimestamp) => {
  return playlist.find((entry) => {
    if (!entry.songId) {
      return false;
    }

    return (
      new Date(entry.timestamp).valueOf() <
      new Date(prevSongTimestamp).valueOf()
    );
  });
};

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

      playlistKey: null,
      mixtapeId: null,
      currentSongPlaylistTimestamp: null,

      /** list of song IDs */
      queue: [],
    };
  },

  mutations: {
    setPlayer(state, player) {
      state.player = player;
    },

    setPlaybackSource(
      state,
      { playlistKey, mixtapeId, playbackSourceLabel, playbackSourcePath }
    ) {
      if (playlistKey) {
        state.playlistKey = playlistKey;
        state.mixtapeId = null;
      } else if (mixtapeId) {
        state.playlistKey = null;
        state.mixtapeId = mixtapeId;
      }

      state.playbackSourceLabel = playbackSourceLabel;
      state.playbackSourcePath = playbackSourcePath;
    },

    playSong(state, { songId, songPlaylistTimestamp }) {
      state.currentSongId = songId;
      state.currentSongPlaylistTimestamp = songPlaylistTimestamp;
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
    /**
     * Play a specific song by ID.
     */
    async playSong(context, { songId, songPlaylistTimestamp }) {
      const player = context.rootState.currentUser.hasSpotify
        ? 'spotify'
        : 'applemusic';

      context.commit('setPlayer', player);
      context.commit('playSong', { songId, songPlaylistTimestamp });

      const playerInstance = await getOrCreatePlayer(player, {
        store: this,
      });

      const song = context.getters.currentSong;
      playerInstance.setSong(song);
    },

    /**
     * Go to the next song in the current queue or playlist.
     */
    async nextSong(context) {
      // mixtape playback
      if (context.state.mixtapeId) {
        const mixtapeId = context.state.mixtapeId;
        const mixtape = context.rootState.mixtapes[mixtapeId];
        const tracks = mixtape.tracks;
        const songIdx = tracks.findIndex(
          (id) => id === context.state.currentSongId
        );
        if (songIdx === -1) {
          // song was removed from mixtape, so we can't find the next song
          // [shrug emoticon goes here]
          return;
        }
        const nextSongId = tracks[songIdx + 1];

        if (!nextSongId) {
          // queue playback ended
          return;
        }

        context.dispatch('playSong', {
          songId: nextSongId,
        });
      } else if (context.state.playlistKey) {
        const playlistKey = context.state.playlistKey;
        const playlist = context.rootState.playlists[playlistKey].items;
        const nextEntry = getNextSongEntry(
          playlist,
          context.state.currentSongPlaylistTimestamp
        );

        if (!nextEntry) {
          // load next page
        } else {
          context.dispatch('playSong', {
            songId: nextEntry.songId,
            songPlaylistTimestamp: nextEntry.timestamp,
          });
        }
      }
    },

    /**
     * Play a mixtape starting with a specific song ID.
     */
    playFromMixtape(context, { mixtapeId, songId }) {
      const mixtape = context.rootState.mixtapes[mixtapeId];
      const playbackSourceLabel = mixtape.title;
      const playbackSourcePath = `/mixtapes/${mixtapeId}`;

      context.commit('setPlaybackSource', {
        mixtapeId,
        playbackSourceLabel,
        playbackSourcePath,
      });

      context.dispatch('playSong', { songId });
    },

    playFromPlaylist(
      context,
      { playlistKey, songId, playbackSourceLabel, playbackSourcePath }
    ) {
      const playlist = context.rootState.playlists[playlistKey].items;
      const entry = playlist.find((entry) => entry.songId === songId);
      context.commit('setPlaybackSource', {
        playlistKey,
        playbackSourceLabel,
        playbackSourcePath,
      });

      context.dispatch('playSong', {
        songId,
        songPlaylistTimestamp: entry.timestamp,
      });
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
