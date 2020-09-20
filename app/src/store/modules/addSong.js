const addSong = {
  actions: {
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
    },
  },
};

export default addSong;
