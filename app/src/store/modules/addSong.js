const addSong = {
  state() {
    return {
      showModal: false,
      initialSearch: null,
    };
  },

  mutations: {
    showAddSongModal(state, initialSearch) {
      state.showModal = true;
      state.initialSearch = initialSearch;
    },
    closeAddSongModal(state) {
      state.showModal = false;
    },
    clearInitialSearch(state) {
      state.initialSearch = null;
    },
  },

  actions: {
    showAddSong(context, initialSearch) {
      context.commit('showAddSongModal', initialSearch);
    },

    closeAddSong(context) {
      context.commit('closeAddSongModal');
    },

    didSubmitSong(context, { song, currentPath }) {
      context.commit('addSongs', [song], { root: true });

      // Refresh the user's feed or the current user's page if they're on that
      // page
      const userName = context.rootState.currentUser.name;
      const profilePath = `/users/${userName}`;
      if (currentPath === '/') {
        context.dispatch('loadNewPlaylistEntries', {
          key: 'feed',
        });
      } else if (currentPath === profilePath) {
        context.dispatch('loadNewPlaylistEntries', {
          key: `${userName}/posts`,
        });
      }

      context.commit('closeAddSongModal');
    },
  },
};

export default addSong;
