import { getInitializedPlayer, getOrCreatePlayer } from '../../players';
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
      secondsTotal: null,
      secondsElapsed: null,
      volume: 1,

      /** Currently playing song ID*/
      currentSongId: null,

      playbackSourceLabel: null,
      playbackSourcePath: null,

      playlistKey: null,
      mixtapeId: null,
      currentSongPlaylistTimestamp: null,
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

    setVolume(state, volume) {
      state.volume = volume;
    },
  },

  actions: {
    /**
     * Play a specific song by ID.
     */
    async playSong(context, { songId, songPlaylistTimestamp }) {
      const player = context.rootState.streaming.service;

      context.commit('setPlayer', player);
      context.commit('playSong', { songId, songPlaylistTimestamp });

      const storedVolume = parseFloat(localStorage.getItem('playerVolume'));
      const initialVolume = Number.isNaN(storedVolume) ? 1 : storedVolume;
      context.commit('setVolume', initialVolume);

      const playerInstance = await getOrCreatePlayer(player, {
        store: this,
        nativeBridge: this.$nativeBridge,
        initialVolume,
      });

      const song = context.getters.currentSong;

      const missingSpotify = player === 'spotify' && !song.spotifyId;
      const missingAppleMusic = player === 'appleMusic' && !song.appleMusicId;

      // XXX: This UI obviously sucks, but it's better than nothing...
      if (missingSpotify || missingAppleMusic) {
        context.commit(
          'showErrorModal',
          `This song is not available on ${
            missingSpotify ? 'Spotify' : 'Apple Music'
          }. Sorry!`,
          { root: true }
        );
        context.commit('clearPlayback');
        return;
      }

      playerInstance.setSong(song);
    },

    /**
     * Go to the next song in the current mixtape or playlist.
     */
    async nextSong(context) {
      if (context.state.isPlaying) {
        const playerInstance = getInitializedPlayer(context.state.player);
        playerInstance.pause();
      }

      // mixtape playback
      if (context.state.mixtapeId) {
        const mixtapeId = context.state.mixtapeId;
        const tracks = context.rootState.mixtapes.tracksByMixtapeId[mixtapeId];
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
          context.dispatch('clearPlayback');
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
          if (playlist.itemsExhausted) {
            context.dispatch('clearPlayback');
            return;
          }

          // TODO: Put a loading state here, e.g...
          // context.commit('sync', { isBuffering: true });

          await context.dispatch(
            'loadNextPlaylistPage',
            { key: playlistKey },
            { root: true }
          );

          context.dispatch('nextSong');
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
    playFromMixtape(context, { mixtapeId, mixtapeSlug, songId }) {
      const mixtape = context.rootState.mixtapes.mixtapesById[mixtapeId];
      const playbackSourceLabel = mixtape.title;
      const playbackSourcePath = `/mixtapes/${mixtapeId}/${mixtapeSlug}`;

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
      if (
        songId === context.state.currentSongId &&
        playlistKey === context.state.playlistKey
      ) {
        // if the song's already the current song, a click means a play/pause
        // request
        context.dispatch('togglePlayback');
        return;
      }

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

    togglePlayback(context) {
      const playerInstance = getInitializedPlayer(context.state.player);

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

    changeVolume(context, volume) {
      context.commit('setVolume', volume);

      const playerInstance = getInitializedPlayer(context.state.player);
      playerInstance.setVolume(volume);
      localStorage.setItem('playerVolume', volume);
    },
  },

  getters: {
    currentSong(state, getters, rootState) {
      return rootState.songs[state.currentSongId];
    },
  },
};

export default playback;
