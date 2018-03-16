import apiRequest from '../../apiRequest';

const auth = {
  state() {
    return {
      // populated by cookie, see entry-client/entry-server
      authToken: null,

      // populated by /me lookup
      authenticated: false,
    };
  },

  mutations: {
    setAuthToken(state, token) {
      state.authToken = token;
    },
    setCurrentUser(state, user) {
      state.authenticated = true;
    }
  },

  actions: {
    async fetchCurrentUser(context) {
      if (!context.state.authToken) {
        return;
      }

      const resp = await apiRequest(context, {
        url: '/me',
        method: 'GET',
      });

      const user = resp.data.user;

      if (!user) {
        // TODO: auth token is bad so we should unset it here, I guess?
        return;
      }

      context.commit('setCurrentUser', user);
    },
  },
};

export default auth;