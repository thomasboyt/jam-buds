import apiRequest from '../../apiRequest';

const playlistState = () => {
  return {
    entryIds: [],
    entriesExhausted: false,
    url: null,
  };
}

/**
 * TODO:
 * Consider collapsing key and url into the same field
 * Instead of having profilePosts/profileLikes, just have a buncha playlists
 */

const playlists = {
  state() {
    return {
      feed: {...playlistState(), url: '/feed'},
      profilePosts: playlistState(),
      profileLikes: playlistState(),
    };
  },

  mutations: {
    resetPlaylist(state, {key, url}) {
      state[key].entryIds = [];
      state[key].entriesExhausted = false;
      if (url) {
        state[key].url = url;
      }
    },

    addPlaylistEntryToHead(state, {key, entry}) {
      state[key].entryIds = [entry.id].concat(state[key].entryIds);
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
    async loadPlaylistPage(context, {key, initial, url}={}) {
      if (!context.state[key]) {
        throw new Error(`undefined playlist ${key}`);
      }

      if (initial) {
        context.commit('resetPlaylist', {key, url});
      }

      const previousId = context.state[key].entryIds.slice(-1)[0];

      const resp = await apiRequest(context, {
        url: context.state[key].url,
        method: 'GET',
        params: {previousId},
      });

      context.commit('addPlaylistEntries', resp.data.tracks);
      context.commit('pushPlaylist', {key, page: resp.data});

      return resp.data;
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