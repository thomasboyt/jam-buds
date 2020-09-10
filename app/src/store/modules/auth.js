const auth = {
  state() {
    return {
      // populated by /me lookup
      authenticated: false,
    };
  },

  mutations: {
    setCurrentUser(state) {
      state.authenticated = true;
    },
  },

  actions: {
    async signInWithToken(context, token) {
      const resp = await this.$axios({
        url: '/sign-in',
        method: 'POST',
        data: {
          signInToken: token,
        },
        withCredentials: true,
      });
      return resp.data.authToken;
    },

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
      }
    },
  },
};

export default auth;
