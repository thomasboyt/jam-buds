import Vue from 'vue';

const mixtapes = {
  state() {
    // [k, v] -> [id, resource]
    return {};
  },

  mutations: {
    setPlaylist(state, { id, data }) {
      // TODO: probably more to do here
      Vue.set(state, id, data);
    },
  },

  actions: {
    async loadMixtape(context, id) {
      const resp = await this.$axios({
        url: `/mixtapes/${id}`,
        method: 'GET',
      });

      context.commit('addSongs', resp.data.tracks.map((entry) => entry.song));
      context.commit('setPlaylist', { id, data: resp.data });

      return resp.data;
    },
  },
};

export default mixtapes;
