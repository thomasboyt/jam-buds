import _get from 'lodash/get';

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

    didSubmitSong(context, entry) {
      context.commit('addPlaylistEntries', [entry], { root: true });

      // Add the entry to the top of the user's feed
      context.commit(
        'addPlaylistEntryToHead',
        { key: 'feed', entry },
        { root: true }
      );

      // Add the entry to the top of the user's playlist if they're on that page
      if (_get(context.rootState.profile.user, 'name') === entry.user.name) {
        context.commit(
          'addPlaylistEntryToHead',
          { key: 'profilePosts', entry },
          { root: true }
        );
      }

      context.commit('closeModal');
    },
  },
};

export default addSong;
