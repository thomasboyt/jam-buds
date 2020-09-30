import Vue from 'vue';

const profiles = {
  state() {
    // name -> profile
    return {};
  },

  mutations: {
    addProfiles(state, profiles) {
      for (let profile of profiles) {
        Vue.set(state, profile.name, profile);
      }
    },
    updateProfileColorScheme(state, { name, colorScheme }) {
      state[name].colorScheme = colorScheme;
    },
  },

  actions: {
    async loadProfileForUser(context, userName) {
      console.log('loading profile');
      const resp = await this.$axios({
        url: `/users/${userName}`,
        method: 'GET',
      });

      context.commit('addProfiles', [resp.data.userProfile]);
    },
  },

  getters: {
    currentUserColorScheme(state, getters, rootState) {
      return state[rootState.currentUser.name]?.colorScheme;
    },
  },
};

export default profiles;
