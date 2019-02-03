import Vue from 'vue';

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
    setFriendSuggestions(state, suggestions) {
      // XXX: is there a reason this uses Vue.set?
      Vue.set(state, 'friendSuggestions', suggestions);
    },
    updateColorScheme(state, scheme) {
      state.colorScheme = scheme;
    },
  },

  actions: {
    async followUser(context, name) {
      console.log('following', name);
      const resp = await this.$axios({
        url: '/following',
        method: 'POST',
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

    async loadFriendSuggestions(context) {
      const resp = await this.$axios({
        url: `/friend-suggestions`,
        method: 'GET',
      });

      context.commit('setFriendSuggestions', resp.data.users);
    },
  },

  getters: {
    isFollowing: (state) => (name) => {
      return state.following.some((user) => user.name === name);
    },
  },
};

export default currentUser;
