import Vue from 'vue';

const profile = {
  state() {
    return {
      user: null,
      followers: null,
      following: null,
    };
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
      const data = await context.dispatch('loadPlaylist', {
        key: `${userName}/posts`,
        url: `/playlists/${userName}`,
      });

      this.commit('setViewedProfile', data.userProfile);
    },

    async loadProfileLikesPlaylist(context, userName) {
      const data = await context.dispatch('loadPlaylist', {
        key: `${userName}/likes`,
        url: `/playlists/${userName}/liked`,
      });

      this.commit('setViewedProfile', data.userProfile);
    },

    async loadProfileFollowing(context, userName) {
      const resp = await this.$axios({
        url: `/users/${userName}/following`,
        method: 'GET',
      });
      const userProfile = resp.data.userProfile;
      const following = resp.data.users;

      this.commit('setViewedProfile', userProfile);
      this.commit('setFollowing', following);
    },

    async loadProfileFollowers(context, userName) {
      const resp = await this.$axios({
        url: `/users/${userName}/followers`,
        method: 'GET',
      });
      const userProfile = resp.data.userProfile;
      const followers = resp.data.users;

      this.commit('setViewedProfile', userProfile);
      this.commit('setFollowers', followers);
    },
  },
};

export default profile;
