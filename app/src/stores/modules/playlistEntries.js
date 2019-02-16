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
      state[id].song.isLiked = true;
    },
    unlikePlaylistEntry(state, id) {
      state[id].song.isLiked = false;
    },
  },

  actions: {
    async likePlaylistEntry(context, { id }) {
      const songId = context.state[id].song.id;

      await this.$axios({
        url: `/likes/${songId}`,
        method: 'PUT',
      });

      context.commit('likePlaylistEntry', id);
    },

    async unlikePlaylistEntry(context, { id }) {
      const songId = context.state[id].song.id;

      await this.$axios({
        url: `/likes/${songId}`,
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
