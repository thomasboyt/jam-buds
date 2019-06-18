const playlistState = () => {
  return {
    items: [],
    itemsExhausted: false,
    url: null,
  };
};

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
    return {
      feed: { ...playlistState(), url: '/feed' },
      publicFeed: { ...playlistState(), url: '/public-feed' },
      profilePosts: playlistState(),
      profileLikes: playlistState(),
    };
  },

  mutations: {
    resetPlaylist(state, { key, url }) {
      state[key].items = [];
      state[key].itemsExhausted = false;
      if (url) {
        state[key].url = url;
      }
    },

    addPlaylistItemToHead(state, { key, entry }) {
      const denormalizedItem = denormalizeItem(entry);

      const existing = state[key].items.find(
        (playlistItem) => playlistItem.songId === denormalizedItem.songId
      );

      if (existing) {
        // remove old record
        state[key].items = state[key].items.filter(
          (playlistItem) => playlistItem.songId !== denormalizedItem.songId
        );

        // XXX: The entry returned from the post endpoint currently only
        // includes the current user's name, so we add the rest here
        denormalizedItem.userNames = denormalizedItem.userNames.concat(
          existing.userNames
        );
      }

      state[key].items = [denormalizedItem].concat(state[key].items);
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

          if (items[existingIdx].userNames.length === 1) {
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
    async loadPlaylistPage(context, { key, initial, url } = {}) {
      if (!context.state[key]) {
        throw new Error(`undefined playlist ${key}`);
      }

      if (initial) {
        context.commit('resetPlaylist', { key, url });
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
