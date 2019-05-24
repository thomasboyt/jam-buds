const playlistState = () => {
  return {
    entries: [],
    entriesExhausted: false,
    url: null,
  };
};

function denormalizeEntry(entry) {
  const denormalizedEntry = {
    ...entry,
    songId: entry.song.id,
  };

  delete denormalizedEntry.song;

  return denormalizedEntry;
}

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
      const denormalizedEntry = denormalizeEntry(entry);

      const existing = state[key].entries.find(
        (playlistEntry) => playlistEntry.songId === denormalizedEntry.songId
      );

      if (existing) {
        // remove old record
        state[key].entries = state[key].entries.filter(
          (playlistEntry) => playlistEntry.songId !== denormalizedEntry.songId
        );

        // XXX: The entry returned from the post endpoint currently only
        // includes the current user's name, so we add the rest here
        denormalizedEntry.userNames = denormalizedEntry.userNames.concat(
          existing.userNames
        );
      }

      state[key].entries = [denormalizedEntry].concat(state[key].entries);
    },

    /**
     * Append a new page of entries to a playlist.
     */
    pushPlaylist(state, { key, page }) {
      state[key].entries = state[key].entries.concat(
        page.tracks.map((entry) => denormalizeEntry(entry))
      );

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
      const previousTimestamp = previousEntry
        ? previousEntry.timestamp
        : undefined;

      const resp = await this.$axios({
        url: context.state[key].url,
        method: 'GET',
        params: { before: previousTimestamp },
      });

      context.commit('addSongs', resp.data.tracks.map((entry) => entry.song));
      context.commit('pushPlaylist', { key, page: resp.data });

      return resp.data;
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
