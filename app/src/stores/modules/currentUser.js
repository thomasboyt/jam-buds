import Vue from 'vue';
import apiRequest from '../../apiRequest';

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
      Vue.set(state, 'friendSuggestions', suggestions);
    },
  },

  actions: {
    async followUser(context, name) {
      console.log('following', name);
      const resp = await apiRequest(context, {
        url: '/following',
        method: 'POST',
        data: {
          userName: name,
        },
      });
      context.commit('addFollowedUser', resp.data.user);
    },

    async unfollowUser(context, name) {
      await apiRequest(context, {
        url: `/following/${name}`,
        method: 'DELETE',
      });

      context.commit('removeFollowedUser', name);
    },

    async loadFriendSuggestions(context) {
      const resp = await apiRequest(context, {
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
