import Vue from 'vue';
import apiRequest from '../../apiRequest';

const profile = {
  state() {
    return {
      user: null,
      followers: [],
      following: [],
    }
  },

  mutations: {
    setViewedProfile(state, userProfile) {
      Vue.set(state, 'user', userProfile);
    }
  },

  actions: {
    async loadProfilePostsPlaylist(context, userName) {
      const data = await context.dispatch('loadPlaylistPage', {
        key: 'profilePosts',
        initial: true,
        url: `/playlists/${userName}`,
      });

      this.commit('setViewedProfile', data.userProfile);
    },

    async loadProfileLikesPlaylist(context, userName) {
      const data = await context.dispatch('loadPlaylistPage', {
        key: 'profileLikes',
        initial: true,
        url: `/playlists/${userName}/liked`,
      });

      this.commit('setViewedProfile', data.userProfile);
    },
  }
};

export default profile;