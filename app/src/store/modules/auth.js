const auth = {
  state() {
    return {
      authToken: null,
      // populated by /me lookup
      authenticated: false,
    };
  },

  mutations: {
    setCurrentUser(state) {
      state.authenticated = true;
    },
    setAuthToken(state, authToken) {
      state.authToken = authToken;
    },
  },

  actions: {
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
        context.commit('setCurrentUser', user);
        context.commit('addProfiles', [user.profile]);
      }
    },
  },
};

export default auth;
