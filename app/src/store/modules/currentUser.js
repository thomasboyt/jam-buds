const currentUser = {
  state() {
    return {};
  },

  mutations: {
    setCurrentUser(state, user) {
      Object.assign(state, user);
    },
    addFollowedUser(state, user) {
      state.following = state.following.concat([user]);
    },
    removeFollowedUser(state, name) {
      state.following = state.following.filter((user) => user.name !== name);
    },
    disconnectedTwitter(state) {
      state.twitterName = null;
    },
    updateUserPrivacy(state, { showInPublicFeed }) {
      state.showInPublicFeed = showInPublicFeed;
    },
  },

  actions: {
    async followUser(context, name) {
      const resp = await this.$axios({
        url: `/following/${name}`,
        method: 'PUT',
        data: {
          userName: name,
        },
      });
      context.commit('addFollowedUser', resp.data.user);
    },

    async unfollowUser(context, name) {
      await this.$axios({
        url: `/following/${name}`,
        method: 'DELETE',
      });

      context.commit('removeFollowedUser', name);
    },

    async signOut() {
      try {
        await this.$axios({
          baseURL: null,
          url: '/api/sign-out',
          method: 'POST',
        });
      } catch (err) {
        this.$store.commit('showErrorModal');
        throw err;
      }
    },
  },

  getters: {
    isFollowing: (state) => (name) => {
      return state.following.some((user) => user.name === name);
    },
  },
};

export default currentUser;
