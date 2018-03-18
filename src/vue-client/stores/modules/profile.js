import Vue from 'vue';
import apiRequest from '../../apiRequest';

const profile = {
  state() {
    return {
      user: null,
      followers: null,
      following: null,
    }
  },

  mutations: {
    setViewedProfile(state, userProfile) {
      Vue.set(state, 'user', userProfile);
    },
    setFollowing(state, following) {
      Vue.set(state, 'following', following);
    },
    setFollowers(state, followers) {
      Vue.set(state, 'followers', followers);
    },
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

    async loadProfileFollowing(context, userName) {
      const resp = await apiRequest(context, {
        url: `/users/${userName}/following`,
        method: 'GET',
      });
      const userProfile = resp.data.userProfile;
      const following = resp.data.users;

      this.commit('setViewedProfile', userProfile);
      this.commit('setFollowing', following);
    },

    async loadProfileFollowers(context, userName) {
      const resp = await apiRequest(context, {
        url: `/users/${userName}/followers`,
        method: 'GET',
      });
      const userProfile = resp.data.userProfile;
      const followers = resp.data.users;

      this.commit('setViewedProfile', userProfile);
      this.commit('setFollowers', followers);
    }
  }
};

export default profile;