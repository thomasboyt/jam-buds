import apiRequest from '../../apiRequest';

const feed = {
  state() {
    return {
      entryIds: [],
      entriesExhausted: false,
    };
  },

  mutations: {
    resetFeed(state) {
      state.entryIds = [];
      state.entriesExhausted = false;
    },

    pushFeed(state, page) {
      const newIds = page.tracks.map((entry) => entry.id);
      state.entryIds = state.entryIds.concat(newIds);

      if (page.tracks.length < page.limit) {
        state.entriesExhausted = true;
      }
    },

    deletePlaylistEntry(state, id) {
      const index = state.entryIds.indexOf(id);

      if (index === -1) {
        return;
      }

      state.entryIds = state.entryIds.filter((val) => val !== id);
    }
  },

  actions: {
    async loadFeedPage(context, {initial}={}) {
      if (initial) {
        context.commit('resetFeed');
      }

      const previousId = context.state.entryIds.slice(-1)[0];

      const feed = await apiRequest(context, {
        url: '/feed',
        method: 'GET',
        params: {previousId},
      });

      context.commit('addPlaylistEntries', feed.data.tracks);
      context.commit('pushFeed', feed.data);
    },
  },

  getters: {
    feedEntries(state, getters, rootState) {
      if (!state.entryIds) {
        return null;
      }

      return state.entryIds.map((id) => {
        return rootState.playlistEntries[id];
      });
    }
  }
};

export default feed;