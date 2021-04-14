import Vue from 'vue';

export const state = () => {
  return {
    albums: {},
    mixtapes: {},
    songs: {},
  };
};

export const mutations = {
  addMixtape(state, mixtape) {
    Vue.set(state.mixtapes, mixtape.id, mixtape);
  },

  removeMixtape(state, { mixtapeId }) {
    Vue.delete(state.mixtapes, mixtapeId);
  },

  addMixtapes(state, mixtapes) {
    for (const mixtape of mixtapes) {
      Vue.set(state.mixtapes, mixtape.id, mixtape);
    }
  },

  addSongs(state, songs) {
    for (const song of songs) {
      Vue.set(state.songs, song.id, song);
    }
  },

  // items = playlist/feed entries
  addPlaylistItems(state, items) {
    const exists = (item) => !!item;
    const songs = items.map((item) => item.song).filter(exists);
    for (const song of songs) {
      Vue.set(state.songs, song.id, song);
    }
    const albums = items.map((item) => item.album).filter(exists);
    for (const album of albums) {
      Vue.set(state.albums, album.id, album);
    }
    const mixtapes = items.map((item) => item.mixtape).filter(exists);
    for (const mixtape of mixtapes) {
      Vue.set(state.mixtapes, mixtape.id, mixtape);
    }
  },

  markItemAsLiked(state, { itemType, itemId }) {
    const itemKey = itemType + 's';
    const item = state[itemKey][itemId];
    if (!item) {
      console.error(`No item stored for liked ${itemType} ${itemId}`);
      return;
    }
    item.meta.isLiked = true;
    item.meta.likeCount += 1;
  },

  markItemAsUnliked(state, { itemType, itemId }) {
    const itemKey = itemType + 's';
    const item = state[itemKey][itemId];
    if (!item) {
      console.error(`No item stored for unliked ${itemType} ${itemId}`);
      return;
    }
    item.meta.isLiked = false;
    item.meta.likeCount -= 1;
  },

  setMixtapeTitle(state, { mixtapeId, title }) {
    state.mixtapes[mixtapeId].title = title;
  },

  setMixtapeSlug(state, { mixtapeId, slug }) {
    state.mixtapes[mixtapeId].slug = slug;
  },

  setMixtapePublished(state, { mixtapeId }) {
    // Using vue.set because publishedAt is not present in returned mixtape
    // resource if the playlist isn't published yet, so Vue doesn't pick it
    // up w/r/t reactivity.
    Vue.set(state.mixtapes[mixtapeId], 'publishedAt', new Date().toISOString());
  },
};

export const actions = {
  async likeItem(
    context,
    { itemType, itemId, likeSource, sourceMixtapeId, sourceUserNames }
  ) {
    await this.$axios({
      url: `/likes/${itemType}s/${itemId}`,
      method: 'PUT',
      params: {
        likeSource,
        sourceMixtapeId,
        sourceUserNames: sourceUserNames?.join(','),
      },
    });

    context.commit('markItemAsLiked', { itemType, itemId });
  },

  async unlikeItem(context, { itemType, itemId }) {
    await this.$axios({
      url: `/likes/${itemType}s/${itemId}`,
      method: 'DELETE',
    });

    context.commit('markItemAsUnliked', { itemType, itemId });
  },

  async markSongPlayed(context, id) {
    await this.$axios({
      url: `/songs/${id}/listened`,
      method: 'PUT',
    });
  },
};
