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
    disconnectedTwitter(state) {
      state.twitterName = null;
    },
    updateUserPrivacy(state, { showInPublicFeed }) {
      state.showInPublicFeed = showInPublicFeed;
    },
    setDraftMixtapes(state, mixtapes) {
      state.draftMixtapes = mixtapes;
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

    async loadFriendSuggestions(context) {
      const resp = await this.$axios({
        url: `/friend-suggestions`,
        method: 'GET',
      });

      context.commit('setFriendSuggestions', resp.data.users);
    },

    async loadDraftMixtapes(context) {
      const resp = await this.$axios({
        url: `/draft-mixtapes`,
        method: 'GET',
      });

      context.commit('setDraftMixtapes', resp.data.mixtapes);
      context.commit('addMixtapes', resp.data.mixtapes);
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
