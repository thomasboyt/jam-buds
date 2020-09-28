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
};

export default profiles;
