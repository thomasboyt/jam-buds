import Vue from 'vue';

const songs = {
  state() {
    return {};
  },

  mutations: {
    addSongs(state, songs) {
      for (let song of songs) {
        Vue.set(state, song.id, song);
      }
    },
    likeSong(state, id) {
      state[id].isLiked = true;
    },
    unlikeSong(state, id) {
      state[id].isLiked = false;
    },
  },

  actions: {
    async likeSong(context, { id }) {
      await this.$axios({
        url: `/likes/${id}`,
        method: 'PUT',
      });

      context.commit('likeSong', id);
    },

    async unlikeSong(context, { id }) {
      await this.$axios({
        url: `/likes/${id}`,
        method: 'DELETE',
      });

      context.commit('unlikeSong', id);
    },

    async deleteSong(context, { id }) {
      await this.$axios({
        url: `/posts/${id}`,
        method: 'DELETE',
      });
      context.commit('deleteOwnPlaylistItem', {
        songId: id,
        currentUserName: context.rootState.currentUser.name,
      });
    },
  },
};

export default songs;
