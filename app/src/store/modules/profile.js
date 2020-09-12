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
    async loadProfileForUser(context, userName) {
      const resp = await this.$axios({
        url: `/users/${userName}`,
        method: 'GET',
      });

      context.commit('setViewedProfile', resp.data.userProfile);
    },

    async loadProfilePostsPlaylist(context, userName) {
      await context.dispatch('loadPlaylist', {
        key: `${userName}/posts`,
        url: `/playlists/${userName}`,
      });
    },

    async loadProfileLikesPlaylist(context, userName) {
      await context.dispatch('loadPlaylist', {
        key: `${userName}/likes`,
        url: `/playlists/${userName}/liked`,
      });
    },

    async loadProfileMixtapes(context, userName) {
      await context.dispatch('loadPlaylist', {
        key: `${userName}/mixtapes`,
        url: `/playlists/${userName}?onlyMixtapes=true`,
      });
    },

    async loadProfileFollowing(context, userName) {
      const resp = await this.$axios({
        url: `/users/${userName}/following`,
        method: 'GET',
      });
      const following = resp.data.users;

      context.commit('setFollowing', following);
    },

    async loadProfileFollowers(context, userName) {
      const resp = await this.$axios({
        url: `/users/${userName}/followers`,
        method: 'GET',
      });
      const followers = resp.data.users;

      context.commit('setFollowers', followers);
    },
  },
};

export default profile;
