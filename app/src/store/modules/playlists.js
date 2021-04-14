import Vue from 'vue';

const mixtapeKey = (id) => `mixtape:${id}`;

function denormalizeItem(entry) {
  let id;
  if (entry.type === 'song') {
    id = `song:${entry.song.id}`;
  } else if (entry.type === 'album') {
    id = `album:${entry.album.id}`;
  } else {
    id = `mixtape:${entry.mixtape.id}`;
  }

  const denormalizedItem = {
    ...entry,
    songId: entry.song?.id,
    albumId: entry.album?.id,
    mixtapeId: entry.mixtape?.id,
    id,
  };

  delete denormalizedItem.song;
  delete denormalizedItem.mixtape;
  delete denormalizedItem.album;

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
        /** whether we've successfully tried to load at least one page */
        hasLoadedInitialItems: false,
      });
    },

    addToPlaylistHead(state, { key, items }) {
      const denormalizedItems = items.map((entry) => denormalizeItem(entry));

      // if a playlist item we've already loaded "reappears" further up in the
      // feed, we need to remove it from its old spot
      //
      // this happens if the current user posts a song that was already in their
      // feed, or when the feed is refreshed due to fuzziness in the after=
      // param
      //
      // XXX: This is like O(n^2)-ish but probably fine
      for (let newItem of denormalizedItems) {
        for (let existingItem of state[key].items) {
          if (newItem.id === existingItem.id) {
            state[key].items = state[key].items.filter(
              (playlistItem) => playlistItem.id !== newItem.id
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
      state[key].hasLoadedInitialItems = true;

      state[key].items = state[key].items.concat(
        page.items.map((entry) => denormalizeItem(entry))
      );

      if (page.items.length < page.limit) {
        state[key].itemsExhausted = true;
      }
    },

    deletedPost(state, { id }) {
      // After you delete a post, remove the post from any playlist, including
      // aggregate items where yours was the only post
      for (let key of Object.keys(state)) {
        const existingIdx = state[key].items.findIndex(
          (entry) =>
            entry.postId === id ||
            entry.posts?.find((post) => post.postId === id)
        );

        if (existingIdx !== -1) {
          const items = state[key].items.slice();

          if (
            !items[existingIdx].posts ||
            items[existingIdx].posts.length === 1
          ) {
            // remove this post since it's the only post
            items.splice(existingIdx, 1);
          } else {
            items[existingIdx].posts = items[existingIdx].posts.filter(
              (post) => post.postId !== id
            );
          }

          state[key].items = items;
        }
      }
    },

    deleteOwnPlaylistMixtape(state, { mixtapeId }) {
      for (let key of Object.keys(state)) {
        const existingIdx = state[key].items.findIndex(
          (entry) => entry.id === mixtapeKey(mixtapeId)
        );
        if (existingIdx !== -1) {
          const items = state[key].items.slice();
          items.splice(existingIdx, 1);
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

      context.dispatch('addPlaylistResources', resp.data);
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

      context.dispatch('addPlaylistResources', resp.data);
      context.commit('addToPlaylistHead', { key, items: resp.data.items });

      return resp.data;
    },

    addPlaylistResources(context, { items, profiles }) {
      context.commit('addPlaylistItems', items);
      if (profiles) {
        context.commit('addProfiles', profiles);
      }
    },

    async loadProfilePostsPlaylist(context, userName) {
      await context.dispatch('loadPlaylist', {
        key: `${userName}/posts`,
        url: `/playlists/${userName}`,
      });
    },

    async loadProfileLikesPlaylist(context, userName) {
      await context.dispatch('loadPlaylist', {
        key: `${userName}/likes`,
        url: `/playlists/${userName}/liked`,
      });
    },

    async loadProfileMixtapes(context, userName) {
      await context.dispatch('loadPlaylist', {
        key: `${userName}/mixtapes`,
        url: `/playlists/${userName}?onlyMixtapes=true`,
      });
    },

    async deletePost(context, { id }) {
      await this.$axios({
        url: `/posts/${id}`,
        method: 'DELETE',
      });
      context.commit('deletedPost', { id });
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
