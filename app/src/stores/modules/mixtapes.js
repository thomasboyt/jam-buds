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

    appendToMixtape(state, { songId, mixtapeId }) {
      const mixtape = state[mixtapeId];
      state[mixtapeId] = {
        ...mixtape,
        tracks: mixtape.tracks.concat([songId]),
      };
    },

    removeFromMixtape(state, { songId, mixtapeId }) {
      const mixtape = state[mixtapeId];
      state[mixtapeId] = {
        ...mixtape,
        tracks: mixtape.tracks.filter(
          (mixtapeSongId) => mixtapeSongId !== songId
        ),
      };
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
  },

  getters: {
    getMixtape(state) {
      return (key) => {
        const mixtape = state[key];
        if (!mixtape) {
          throw new Error(`undefined mixtape ${key}`);
        }

        return mixtape;
      };
    },
  },
};

export default mixtapes;
