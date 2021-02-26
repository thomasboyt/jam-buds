import Vue from 'vue';

const albums = {
  state() {
    return {};
  },

  mutations: {
    addAlbums(state, albums) {
      for (let album of albums) {
        Vue.set(state, album.id, album);
      }
    },
    likeAlbum(state, id) {
      state[id].meta.isLiked = true;
      state[id].meta.likeCount += 1;
    },
    unlikeAlbum(state, id) {
      state[id].meta.isLiked = false;
      state[id].meta.likeCount -= 1;
    },
  },
};

export default albums;
