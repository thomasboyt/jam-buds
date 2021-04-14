import { getterTree, mutationTree, actionTree } from 'typed-vuex';
import { ApiSchema } from '~/api/_helpers';
import { getInitializedPlayer, getOrCreatePlayer } from '../players';
import { DenormalizedItem } from './playlists';

type SongWithMeta = ApiSchema<'SongWithMeta'>;
type Player = any; // TODO
type Timestamp = number; // TODO: should be string
const getNativeBridge = (obj: any): any => obj.$nativeBridge; // TODO

// This takes advantage of playlist being ordered
const getNextSongEntry = (
  playlist: DenormalizedItem[],
  prevSongTimestamp: Timestamp
) => {
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

interface PlaybackState {
  player: Player;
  isPlaying: boolean;
  isBuffering: boolean;
  secondsTotal: number | null;
  secondsElapsed: number | null;
  volume: number;
  currentSongId: number | null;
  playbackSourceLabel: string | null;
  playbackSourcePath: string | null;
  playlistKey: string | null;
  mixtapeId: number | null;
  currentSongPlaylistTimestamp: Timestamp | null;
}

export const state = (): PlaybackState => {
  return {
    player: null,

    isPlaying: false,
    isBuffering: false,
    secondsTotal: null,
    secondsElapsed: null,
    volume: 1,

    /** Currently playing song ID */
    currentSongId: null,

    playbackSourceLabel: null,
    playbackSourcePath: null,

    playlistKey: null,
    mixtapeId: null,
    currentSongPlaylistTimestamp: null,
  };
};

export const getters = getterTree(state, {
  currentSong(state, getters, rootState): SongWithMeta | null {
    if (!state.currentSongId) {
      return null;
    }
    return rootState.playlistItems.songs[state.currentSongId] || null;
  },
});

export const mutations = mutationTree(state, {
  setPlayer(state, player: Player) {
    state.player = player;
  },

  setPlaybackSource(
    state,
    {
      playlistKey,
      mixtapeId,
      playbackSourceLabel,
      playbackSourcePath,
    }: {
      playlistKey?: string;
      mixtapeId?: number;
      playbackSourceLabel: string;
      playbackSourcePath: string;
    }
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

  playSong(
    state,
    {
      songId,
      songPlaylistTimestamp,
    }: { songId: number; songPlaylistTimestamp: Timestamp }
  ) {
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

  // TODO: replace this
  sync(state, syncState: Partial<PlaybackState>) {
    for (const key of Object.keys(syncState)) {
      (state as any)[key] = (syncState as any)[key];
    }
  },

  setVolume(state, volume: number) {
    state.volume = volume;
  },
});

export const actions = actionTree(
  { state, getters, mutations },
  {
    /**
     * Play a specific song by ID.
     */
    async playSong(
      context,
      {
        songId,
        songPlaylistTimestamp,
      }: { songId: number; songPlaylistTimestamp: Timestamp }
    ): Promise<void> {
      const player = this.app.$accessor.streaming.service;

      context.commit('setPlayer', player);
      context.commit('playSong', { songId, songPlaylistTimestamp });

      const storedVolume = parseFloat(
        localStorage.getItem('playerVolume') || ''
      );
      const initialVolume = Number.isNaN(storedVolume) ? 1 : storedVolume;
      context.commit('setVolume', initialVolume);

      const playerInstance = await getOrCreatePlayer(player, {
        store: this,
        nativeBridge: getNativeBridge(this),
        initialVolume,
      });

      const song = context.getters.currentSong!;

      const missingSpotify = player === 'spotify' && !song.spotifyId;
      const missingAppleMusic = player === 'appleMusic' && !song.appleMusicId;

      // XXX: This UI obviously sucks, but it's better than nothing...
      if (missingSpotify || missingAppleMusic) {
        this.app.$accessor.showErrorModal(
          `This song is not available on ${
            missingSpotify ? 'Spotify' : 'Apple Music'
          }. Sorry!`
        );
        context.commit('clearPlayback');
        return;
      }

      playerInstance.setSong(song);
    },

    /**
     * Go to the next song in the current mixtape or playlist.
     */
    async nextSong(context): Promise<void> {
      if (context.state.isPlaying) {
        const playerInstance = getInitializedPlayer(context.state.player);
        playerInstance.pause();
      }

      // mixtape playback
      if (context.state.mixtapeId) {
        const mixtapeId = context.state.mixtapeId;
        const tracks = this.app.$accessor.mixtapes.tracksByMixtapeId[mixtapeId];
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
        const playlist = this.app.$accessor.playlists[playlistKey];
        const nextEntry = getNextSongEntry(
          playlist.items,
          context.state.currentSongPlaylistTimestamp!
        );

        if (!nextEntry) {
          if (playlist.itemsExhausted) {
            context.dispatch('clearPlayback');
            return;
          }

          // TODO: Put a loading state here, e.g...
          // context.commit('sync', { isBuffering: true });

          await this.app.$accessor.playlists.loadNextPlaylistPage({
            key: playlistKey,
          });

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
    playFromMixtape(
      context,
      {
        mixtapeId,
        mixtapeSlug,
        songId,
      }: { mixtapeId: number; mixtapeSlug: string; songId: number }
    ): void {
      const mixtape = this.app.$accessor.playlistItems.mixtapes[mixtapeId];
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
    ): void {
      if (
        songId === context.state.currentSongId &&
        playlistKey === context.state.playlistKey
      ) {
        // if the song's already the current song, a click means a play/pause
        // request
        context.dispatch('togglePlayback');
        return;
      }

      const playlist = this.app.$accessor.playlists[playlistKey].items;
      const entry = playlist.find((entry) => entry.songId === songId);
      context.commit('setPlaybackSource', {
        playlistKey,
        playbackSourceLabel,
        playbackSourcePath,
      });

      context.dispatch('playSong', {
        songId,
        songPlaylistTimestamp: entry!.timestamp,
      });
    },

    togglePlayback(context): void {
      const playerInstance = getInitializedPlayer(context.state.player);

      if (context.state.isPlaying) {
        playerInstance.pause();
      } else {
        playerInstance.play();
      }
    },

    clearPlayback(context): void {
      context.commit('clearPlayback');
    },

    sync(context, payload: Partial<PlaybackState>): void {
      context.commit('sync', payload);
    },

    changeVolume(context, volume: number): void {
      context.commit('setVolume', volume);

      const playerInstance = getInitializedPlayer(context.state.player);
      playerInstance.setVolume(volume);
      localStorage.setItem('playerVolume', `${volume}`);
    },
  }
);
