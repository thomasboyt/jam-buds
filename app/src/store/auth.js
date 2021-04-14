export const state = () => {
  return {
    authToken: null,
    // populated by /me lookup
    authenticated: false,
  };
};

export const mutations = {
  setAuthenticated(state) {
    state.authenticated = true;
  },
  setAuthToken(state, authToken) {
    state.authToken = authToken;
  },
};

export const actions = {
  async fetchCurrentUser(context) {
    if (!this.$axios.defaults.headers['X-Auth-Token']) {
      return;
    }

    const resp = await this.$axios({
      url: '/me',
      method: 'GET',
    });

    // GET /api/me returns null if invalid or expired token
    if (resp.data.user) {
      const user = resp.data.user;
      context.commit('setAuthenticated');
      context.commit('currentUser/setCurrentUser', user, { root: true });
      context.commit('profiles/addProfiles', [user.profile], { root: true });
    }
  },
};
