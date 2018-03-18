const addSong = {
  state() {
    return {
      showModal: false,
    };
  },

  mutations: {
    showModal(state) {
      state.showModal = true;
    },
    closeModal(state) {
      state.showModal = false;
    },
  },

  actions: {
    showAddSong(context) {
      context.commit('showModal');
    },
    closeAddSong(context) {
      context.commit('closeModal');
    },
  }
};

export default addSong;