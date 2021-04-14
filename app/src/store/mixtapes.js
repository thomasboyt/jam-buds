import Vue from 'vue';

export const state = () => {
  return {
    tracksByMixtapeId: {},
    draftMixtapes: [],
  };
};

export const mutations = {
  setMixtapeSongs(state, data) {
    const trackIds = data.tracks.map((song) => song.id);
    Vue.set(state.tracksByMixtapeId, data.mixtape.id, trackIds);
  },

  setMixtapeOrder(state, { mixtapeId, songOrder }) {
    Vue.set(state.tracksByMixtapeId, mixtapeId, songOrder);
  },

  appendToMixtape(state, { songId, mixtapeId }) {
    const newTracks = state.tracksByMixtapeId[mixtapeId].concat([songId]);
    Vue.set(state.tracksByMixtapeId, mixtapeId, newTracks);
  },

  removeFromMixtape(state, { songId, mixtapeId }) {
    const newTracks = state[mixtapeId].tracks.filter(
      (mixtapeSongId) => mixtapeSongId !== songId
    );
    Vue.set(state.tracksByMixtapeId, mixtapeId, newTracks);
  },

  removeMixtape(state, { mixtapeId }) {
    Vue.delete(state.tracksByMixtapeId, mixtapeId);
  },

  setDraftMixtapes(state, mixtapes) {
    state.draftMixtapes = mixtapes;
  },
};

export const actions = {
  async loadMixtape(context, id) {
    const resp = await this.$axios({
      url: `/mixtapes/${id}`,
      method: 'GET',
    });

    context.commit('playlistItems/addSongs', resp.data.tracks, {
      root: true,
    });
    context.commit('setMixtapeSongs', resp.data);
    context.commit('playlistItems/addMixtape', resp.data.mixtape, {
      root: true,
    });
    context.commit('profiles/addProfiles', [resp.data.author], {
      root: true,
    });

    return resp.data;
  },

  addSongToMixtape(context, { mixtapeId, song }) {
    context.commit('playlistItems/addSongs', [song], { root: true });
    context.commit('appendToMixtape', { songId: song.id, mixtapeId });
  },

  async removeSongFromMixtape(context, { mixtapeId, songId }) {
    await this.$axios({
      url: `/mixtapes/${mixtapeId}/songs/${songId}`,
      method: 'DELETE',
    });

    context.commit('removeFromMixtape', { mixtapeId, songId });
  },

  async updateMixtapeSongOrder(context, { mixtapeId, songOrder }) {
    // TODO: maybe prevent race conditions here?
    const prevOrder = context.state.tracksByMixtapeId[mixtapeId];
    context.commit('setMixtapeOrder', { mixtapeId, songOrder });

    try {
      await this.$axios({
        method: 'POST',
        url: `/mixtapes/${mixtapeId}/order`,
        data: { songOrder },
      });
    } catch (err) {
      context.commit('setMixtapeOrder', { mixtapeId, songOrder: prevOrder });
      throw err;
    }
  },

  async renameMixtape(context, { mixtapeId, title }) {
    const prevTitle = context.rootState.playlistItems.mixtapes[mixtapeId].title;
    context.commit('setMixtapeTitle', { mixtapeId, title });

    try {
      const resp = await this.$axios({
        method: 'POST',
        url: `/mixtapes/${mixtapeId}/title`,
        data: { title },
      });

      context.commit(
        'playlistItems/setMixtapeSlug',
        {
          mixtapeId,
          slug: resp.data.newSlug,
        },
        { root: true }
      );
    } catch (err) {
      context.commit(
        'playlistItems/setMixtapeTitle',
        { mixtapeId, title: prevTitle },
        { root: true }
      );
      throw err;
    }
  },

  async publishMixtape(context, { mixtapeId }) {
    await this.$axios({
      method: 'POST',
      url: `/mixtapes/${mixtapeId}/publish`,
    });

    context.commit(
      'playlistItems/setMixtapePublished',
      {
        mixtapeId,
      },
      { root: true }
    );
  },

  async deleteMixtape(context, { mixtapeId }) {
    await this.$axios({
      method: 'DELETE',
      url: `/mixtapes/${mixtapeId}`,
    });

    // XXX: This doesn't commit removeMixtape because the mixtape page needs
    // to be navigated away from before we clear that cache, see
    // <mixtape-page />
  },

  removeMixtapeFromCache(context, { mixtapeId }) {
    context.commit('removeMixtape', { mixtapeId });
    context.commit(
      'playlistItems/removeMixtape',
      { mixtapeId },
      { root: true }
    );
    context.commit(
      'playlists/deleteOwnPlaylistMixtape',
      { mixtapeId },
      { root: true }
    );
  },

  async loadDraftMixtapes(context) {
    const resp = await this.$axios({
      url: `/draft-mixtapes`,
      method: 'GET',
    });

    context.commit('setDraftMixtapes', resp.data.mixtapes);
    context.commit('playlistItems/addMixtapes', resp.data.mixtapes, {
      root: true,
    });
  },
};

export const getters = {
  getMixtape(state, getters, rootState) {
    return (key) => {
      const mixtape = rootState.playlistItems.mixtapes[key];

      if (!mixtape) {
        return null;
      }

      return {
        ...mixtape,
        tracks: state.tracksByMixtapeId[key],
        author: rootState.profiles[mixtape.authorName],
      };
    };
  },
};
