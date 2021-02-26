import Vue from 'vue';

const mixtapes = {
  state() {
    // [k, v] -> [id, resource]
    return {
      mixtapesById: {},
      tracksByMixtapeId: {},
    };
  },

  mutations: {
    setMixtape(state, { id, data }) {
      const trackIds = data.tracks.map((song) => song.id);
      Vue.set(state.mixtapesById, id, data.mixtape);
      Vue.set(state.tracksByMixtapeId, id, trackIds);
    },

    setMixtapeTitle(state, { mixtapeId, title }) {
      state.mixtapesById[mixtapeId].title = title;
    },

    setMixtapeSlug(state, { mixtapeId, slug }) {
      state.mixtapesById[mixtapeId].slug = slug;
    },

    setMixtapePublished(state, { mixtapeId }) {
      // Using vue.set because publishedAt is not present in returned mixtape
      // resource if the playlist isn't published yet, so Vue doesn't pick it
      // up w/r/t reactivity.
      Vue.set(
        state.mixtapesById[mixtapeId],
        'publishedAt',
        new Date().toISOString()
      );
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

    addMixtapes(state, mixtapes) {
      for (let mixtape of mixtapes) {
        Vue.set(state.mixtapesById, mixtape.id, mixtape);
      }
    },

    removeMixtape(state, { mixtapeId }) {
      Vue.delete(state.mixtapesById, mixtapeId);
      Vue.delete(state.tracksByMixtapeId, mixtapeId);
    },

    likeMixtape(state, id) {
      state.mixtapesById[id].meta.isLiked = true;
      state.mixtapesById[id].meta.likeCount += 1;
    },

    unlikeMixtape(state, id) {
      state.mixtapesById[id].meta.isLiked = false;
      state.mixtapesById[id].meta.likeCount -= 1;
    },
  },

  actions: {
    async loadMixtape(context, id) {
      const resp = await this.$axios({
        url: `/mixtapes/${id}`,
        method: 'GET',
      });

      context.commit('addSongs', resp.data.tracks);
      context.commit('setMixtape', { id, data: resp.data });
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
      const prevTitle = context.state.mixtapesById[mixtapeId].title;
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
  },

  getters: {
    getMixtape(state, getters, rootState) {
      return (key) => {
        const mixtape = state.mixtapesById[key];

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
