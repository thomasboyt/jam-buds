import Vue from 'vue';

const playlistEntries = {
  state() {
    return {};
  },

  mutations: {
    addPlaylistEntries(state, entries) {
      for (let entry of entries) {
        Vue.set(state, entry.id, entry);
      }
    },
    deletePlaylistEntry(state, id) {
      Vue.delete(state, id);
    },
    likePlaylistEntry(state, id) {
      state[id].isLiked = true;
    },
    unlikePlaylistEntry(state, id) {
      state[id].isLiked = false;
    },
  },

  actions: {
    async likePlaylistEntry(context, { id }) {
      await this.$axios({
        url: `/likes/${id}`,
        method: 'PUT',
      });

      context.commit('likePlaylistEntry', id);
    },

    async unlikePlaylistEntry(context, { id }) {
      await this.$axios({
        url: `/likes/${id}`,
        method: 'DELETE',
      });

      context.commit('unlikePlaylistEntry', id);
    },

    async deletePlaylistEntry(context, { id }) {
      await this.$axios({
        url: `/playlist/${id}`,
        method: 'DELETE',
      });
      context.commit('deletePlaylistEntry', id);
    },
  },
};

export default playlistEntries;
