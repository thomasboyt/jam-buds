const playlistState = () => {
  return {
    entries: [],
    entriesExhausted: false,
    url: null,
  };
};

/**
 * TODO:
 * Consider collapsing key and url into the same field
 * Instead of having profilePosts/profileLikes, just have a buncha playlists
 *
 * A "playlist" is a list of [...], which each have a "song" component.
 */

const playlists = {
  state() {
    return {
      feed: { ...playlistState(), url: '/feed' },
      profilePosts: playlistState(),
      profileLikes: playlistState(),
    };
  },

  mutations: {
    resetPlaylist(state, { key, url }) {
      state[key].entries = [];
      state[key].entriesExhausted = false;
      if (url) {
        state[key].url = url;
      }
    },

    addPlaylistEntryToHead(state, { key, entry }) {
      state[key].entries = [entry].concat(state[key].entries);
    },

    /**
     * Append a new page of entries to a playlist.
     */
    pushPlaylist(state, { key, page }) {
      state[key].entries = state[key].entries.concat(page.tracks);

      if (page.tracks.length < page.limit) {
        state[key].entriesExhausted = true;
      }
    },

    deletePlaylistEntry(state, id) {
      for (let key of Object.keys(state)) {
        state[key].entries = state[key].entries.filter(
          (entry) => entry.id !== id
        );
      }
    },
  },

  actions: {
    async loadPlaylistPage(context, { key, initial, url } = {}) {
      if (!context.state[key]) {
        throw new Error(`undefined playlist ${key}`);
      }

      if (initial) {
        context.commit('resetPlaylist', { key, url });
      }

      const previousEntry = context.state[key].entries.slice(-1)[0];
      const previousId = previousEntry ? previousEntry.id : undefined;

      const resp = await this.$axios({
        url: context.state[key].url,
        method: 'GET',
        params: { previousId },
      });

      context.commit('addSongs', resp.data.tracks.map((entry) => entry.song));
      context.commit('pushPlaylist', { key, page: resp.data });

      const tracks = resp.data.tracks.map((entry) => {
        entry.songId = entry.song.id;
        delete entry.song;
        return entry;
      });

      return {
        ...resp.data,
        tracks,
      };
    },
  },

  getters: {
    playlistEntries(state) {
      return (key) => {
        const playlist = state[key];
        if (!playlist) {
          throw new Error(`undefined playlist ${key}`);
        }

        return playlist.entries;
      };
    },
  },
};

export default playlists;
