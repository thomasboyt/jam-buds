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

    didSubmitSong(context, song) {
      context.commit('addSongs', [song], { root: true });

      // construct a "playlist item" locally. if playlist items get more
      // complicated this may need to be a server refresh some day
      const item = {
        song,
        timestamp: new Date().toISOString(),
        userNames: [context.rootState.currentUser.name],
        type: 'song',
      };

      // Add the entry to the top of the user's feed
      context.commit(
        'addPlaylistItemToHead',
        { key: 'feed', item },
        { root: true }
      );

      // Add the entry to the top of the user's playlist if they're on that page
      if (
        _get(context.rootState.profile.user, 'name') ===
        context.rootState.currentUser.name
      ) {
        context.commit(
          'addPlaylistItemToHead',
          { key: 'profilePosts', item },
          { root: true }
        );
      }

      context.commit('closeModal');
    },
  },
};

export default addSong;
