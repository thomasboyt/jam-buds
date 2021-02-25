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
      state[id].meta.isLiked = true;
      state[id].meta.likeCount += 1;
    },
    unlikeSong(state, id) {
      state[id].meta.isLiked = false;
      state[id].meta.likeCount -= 1;
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

    async markSongPlayed(context, id) {
      await this.$axios({
        url: `/songs/${id}/listened`,
        method: 'PUT',
      });
    },
  },
};

export default songs;
