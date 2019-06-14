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
