import Vue from 'vue';

function denormalizeItem(entry) {
  const denormalizedItem = {
    ...entry,
    songId: entry.song && entry.song.id,
  };

  delete denormalizedItem.song;

  return denormalizedItem;
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
    return {};
  },

  mutations: {
    initializePlaylist(state, { key, url }) {
      Vue.set(state, key, {
        items: [],
        itemsExhausted: false,
        url,
      });
    },

    addToPlaylistHead(state, { key, items }) {
      const denormalizedItems = items.map((entry) => denormalizeItem(entry));

      // XXX: This is like O(n^2)-ish but probably fine
      for (let newItem of denormalizedItems) {
        for (let existingItem of state[key].items) {
          if (newItem.id === existingItem.id) {
            // if a playlist item we've already loaded "reappears" further up in
            // the feed, this means that the current user has reposted it, and
            // we need to remove it from its old spot
            state[key].items = state[key].items.filter(
              (playlistItem) => playlistItem.songId !== newItem.songId
            );
          }
        }
      }

      state[key].items = [...denormalizedItems, ...state[key].items];
    },

    /**
     * Append a new page of items to a playlist.
     */
    pushPlaylist(state, { key, page }) {
      state[key].items = state[key].items.concat(
        page.items.map((entry) => denormalizeItem(entry))
      );

      if (page.items.length < page.limit) {
        state[key].itemsExhausted = true;
      }
    },

    deleteOwnPlaylistItem(state, { songId, currentUserName }) {
      // After you delete your post of a song, remove the song from any playlist
      // where the only poster was you
      for (let key of Object.keys(state)) {
        const existingIdx = state[key].items.findIndex(
          (entry) => entry.songId === songId
        );

        if (existingIdx !== -1) {
          const items = state[key].items.slice();

          if (
            !items[existingIdx].userNames ||
            items[existingIdx].userNames.length === 1
          ) {
            // current user was the only poster, so remove
            items.splice(existingIdx, 1);
          } else {
            items[existingIdx].userNames = items[existingIdx].userNames.filter(
              (name) => name !== currentUserName
            );
          }

          state[key].items = items;
        }
      }
    },
  },

  actions: {
    async loadPlaylist(context, { key, url }) {
      // XXX: This returns resp.data so profile store can pick up the "current
      // profile" from it
      if (context.state[key]) {
        // refresh top of playlist
        return await context.dispatch('loadNewPlaylistEntries', { key });
      } else {
        context.commit('initializePlaylist', { key, url });
        return await context.dispatch('loadNextPlaylistPage', { key });
      }
    },

    async loadNextPlaylistPage(context, { key } = {}) {
      if (!context.state[key]) {
        throw new Error(`undefined playlist ${key}`);
      }

      const previousItem = context.state[key].items.slice(-1)[0];
      const previousTimestamp = previousItem
        ? previousItem.timestamp
        : undefined;

      const resp = await this.$axios({
        url: context.state[key].url,
        method: 'GET',
        params: { before: previousTimestamp },
      });

      context.commit(
        'addSongs',
        resp.data.items.map((item) => item.song).filter((song) => song)
      );
      context.commit('pushPlaylist', { key, page: resp.data });

      return resp.data;
    },

    async loadNewPlaylistEntries(context, { key }) {
      const firstItem = context.state[key].items[0];
      const afterTimestamp = firstItem ? firstItem.timestamp : undefined;

      const resp = await this.$axios({
        url: context.state[key].url,
        method: 'GET',
        params: { after: afterTimestamp },
      });

      context.commit(
        'addSongs',
        resp.data.items.map((item) => item.song).filter((song) => song)
      );
      context.commit('addToPlaylistHead', { key, items: resp.data.items });

      return resp.data;
    },
  },

  getters: {
    playlistItems(state) {
      return (key) => {
        const playlist = state[key];
        if (!playlist) {
          throw new Error(`undefined playlist ${key}`);
        }

        return playlist.items;
      };
    },
  },
};

export default playlists;
