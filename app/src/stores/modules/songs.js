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
    async loadSongDetail(context, { id }) {
      if (context.state[id]) {
        // skip loading if we already have it. this should go away if song
        // detail ever includes additional details not in the playlist results
        // (e.g. notes...)
        return;
      }

      const resp = await this.$axios({
        url: `/songs/${id}`,
        method: 'GET',
      });

      context.commit('addSongs', [resp.data]);
    },

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
