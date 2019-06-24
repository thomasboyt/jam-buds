import Vue from 'vue';

const mixtapes = {
  state() {
    // [k, v] -> [id, resource]
    return {};
  },

  mutations: {
    setMixtape(state, { id, data }) {
      const tracks = data.tracks.map((song) => song.id);
      Vue.set(state, id, {
        ...data,
        tracks,
      });
    },

    setMixtapeOrder(state, { mixtapeId, songOrder }) {
      state[mixtapeId].tracks = songOrder;
    },

    setMixtapeTitle(state, { mixtapeId, title }) {
      state[mixtapeId].title = title;
    },

    setMixtapePublished(state, { mixtapeId }) {
      state[mixtapeId].isPublished = true;
      state[mixtapeId].publishedAt = new Date().toISOString();
    },

    appendToMixtape(state, { songId, mixtapeId }) {
      state[mixtapeId].tracks = state[mixtapeId].tracks.concat([songId]);
    },

    removeFromMixtape(state, { songId, mixtapeId }) {
      state[mixtapeId].tracks = state[mixtapeId].tracks.filter(
        (mixtapeSongId) => mixtapeSongId !== songId
      );
    },

    removeMixtape(state, { mixtapeId }) {
      Vue.delete(state, mixtapeId);
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
      const prevOrder = context.state[mixtapeId].tracks;
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
      const prevTitle = context.state[mixtapeId].title;
      context.commit('setMixtapeTitle', { mixtapeId, title });

      try {
        await this.$axios({
          method: 'POST',
          url: `/mixtapes/${mixtapeId}/title`,
          data: { title },
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

    playFromMixtape(context, { mixtapeId, songId }) {
      const mixtape = context.state[mixtapeId];
      const tracks = mixtape.tracks;
      const songIdx = tracks.findIndex((id) => id === songId);
      const songIds = tracks.slice(songIdx);

      context.dispatch('playback/enqueueAndPlaySongs', {
        songIds,
        playbackSourceLabel: mixtape.title,
        playbackSourcePath: `/mixtapes/${mixtapeId}`,
      });
    },
  },

  getters: {
    getMixtape(state) {
      return (key) => {
        return state[key];
      };
    },
  },
};

export default mixtapes;
