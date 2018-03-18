import Vue from 'vue';
import apiRequest from '../../apiRequest';

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
    }
  },

  actions: {
    async likePlaylistEntry(context, {id}) {
      await apiRequest(context, {
        url: `/likes/${id}`,
        method: 'PUT',
      });

      context.commit('likePlaylistEntry', id);
    },

    async unlikePlaylistEntry(context, {id}) {
      await apiRequest(context, {
        url: `/likes/${id}`,
        method: 'DELETE',
      });

      context.commit('unlikePlaylistEntry', id);
    },

    async deletePlaylistEntry(context, {id}) {
      await apiRequest(context, {
        url: `/playlist/${id}`,
        method: 'DELETE',
      });
      context.commit('deletePlaylistEntry', id);
    }
  },
};

export default playlistEntries;