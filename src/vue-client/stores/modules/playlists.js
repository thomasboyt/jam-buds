import apiRequest from '../../apiRequest';

const playlistState = () => {
  return {
    entryIds: [],
    entriesExhausted: false,
    url: null,
  };
}

const playlists = {
  state() {
    return {
      feed: {...playlistState(), url: '/feed'},
      profilePosts: playlistState(),
      profileLikes: playlistState(),
    };
  },

  mutations: {
    resetPlaylist(state, key) {
      state[key].entryIds = [];
      state[key].entriesExhausted = false;
    },

    pushPlaylist(state, {key, page}) {
      const newIds = page.tracks.map((entry) => entry.id);
      state[key].entryIds = state[key].entryIds.concat(newIds);

      if (page.tracks.length < page.limit) {
        state[key].entriesExhausted = true;
      }
    },

    deletePlaylistEntry(state, id) {
      for (let key of Object.keys(state)) {
        const index = state[key].entryIds.indexOf(id);

        if (index === -1) {
          return;
        }

        state[key].entryIds = state[key].entryIds.filter((val) => val !== id);
      }
    }
  },

  actions: {
    async loadPlaylistPage(context, {key, initial}={}) {
      if (!context.state[key]) {
        throw new Error(`undefined playlist ${key}`);
      }

      if (initial) {
        context.commit('resetPlaylist', key);
      }

      const previousId = context.state[key].entryIds.slice(-1)[0];

      const resp = await apiRequest(context, {
        url: context.state[key].url,
        method: 'GET',
        params: {previousId},
      });
      console.log(resp.data);

      context.commit('addPlaylistEntries', resp.data.tracks);
      context.commit('pushPlaylist', {key, page: resp.data});
    },
  },

  getters: {
    playlistEntries(state, getters, rootState) {
      return (key) => {
        const playlist = state[key];
        if (!playlist) {
          throw new Error(`undefined playlist ${key}`);
        }

        return playlist.entryIds.map((id) => {
          return rootState.playlistEntries[id];
        });
      }
    }
  }
}

export default playlists;