import Vue from 'vue';

export const state = () => {
  // name -> profile
  return {};
};

export const mutations = {
  addProfiles(state, profiles) {
    for (const profile of profiles) {
      Vue.set(state, profile.name, profile);
    }
  },
  updateProfileColorScheme(state, { name, colorScheme }) {
    state[name].colorScheme = colorScheme;
  },
};

export const actions = {
  async loadProfileForUser(context, userName) {
    const resp = await this.$axios({
      url: `/users/${userName}`,
      method: 'GET',
    });

    context.commit('addProfiles', [resp.data.userProfile]);
  },
};

export const getters = {
  currentUserColorScheme(state, getters, rootState) {
    return state[rootState.currentUser.name]?.colorScheme;
  },
};
