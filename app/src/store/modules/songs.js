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
      state[id].likeCount += 1;
    },
    unlikeSong(state, id) {
      state[id].isLiked = false;
      state[id].likeCount -= 1;
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
      context.commit('deleteOwnPlaylistSong', {
        songId: id,
        currentUserName: context.rootState.currentUser.name,
      });
    },
  },
};

export default songs;
