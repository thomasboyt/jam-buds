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
    async markSongPlayed(context, id) {
      await this.$axios({
        url: `/songs/${id}/listened`,
        method: 'PUT',
      });
    },
  },
};

export default songs;
