import Vue from 'vue';

const mixtapes = {
  state() {
    return {
      tracksByMixtapeId: {},
      draftMixtapes: [],
    };
  },

  mutations: {
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
  },

  actions: {
    async loadMixtape(context, id) {
      const resp = await this.$axios({
        url: `/mixtapes/${id}`,
        method: 'GET',
      });

      context.commit('addSongs', resp.data.tracks);
      context.commit('setMixtapeSongs', resp.data);
      context.commit('addMixtape', resp.data.mixtape);
      context.commit('addProfiles', [resp.data.author]);

      return resp.data;
    },

    addSongToMixtape(context, { mixtapeId, song }) {
      context.commit('addSongs', [song]);
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
      const prevTitle =
        context.rootState.playlistItems.mixtapes[mixtapeId].title;
      context.commit('setMixtapeTitle', { mixtapeId, title });

      try {
        const resp = await this.$axios({
          method: 'POST',
          url: `/mixtapes/${mixtapeId}/title`,
          data: { title },
        });

        context.commit('setMixtapeSlug', {
          mixtapeId,
          slug: resp.data.newSlug,
        });
      } catch (err) {
        context.commit('setMixtapeTitle', { mixtapeId, title: prevTitle });
        throw err;
      }
    },

    async publishMixtape(context, { mixtapeId }) {
      await this.$axios({
        method: 'POST',
        url: `/mixtapes/${mixtapeId}/publish`,
      });

      context.commit('setMixtapePublished', {
        mixtapeId,
      });
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
      context.commit('deleteOwnPlaylistMixtape', { mixtapeId });
    },

    async loadDraftMixtapes(context) {
      const resp = await this.$axios({
        url: `/draft-mixtapes`,
        method: 'GET',
      });

      context.commit('setDraftMixtapes', resp.data.mixtapes);
      context.commit('addMixtapes', resp.data.mixtapes);
    },
  },

  getters: {
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
  },
};

export default mixtapes;
