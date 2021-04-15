import { actionTree, mutationTree } from 'typed-vuex';

interface AuthState {
  authToken: string | null;
  authenticated: boolean;
}

export const state = (): AuthState => {
  return {
    authToken: null,
    // populated by /me lookup
    authenticated: false,
  };
};

export const mutations = mutationTree(state, {
  setAuthenticated(state) {
    state.authenticated = true;
  },
  setAuthToken(state, authToken) {
    state.authToken = authToken;
  },
});

export const actions = actionTree(
  { state, mutations },
  {
    async fetchCurrentUser(context): Promise<void> {
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
        this.app.$accessor.currentUser.setCurrentUser(user);
        this.app.$accessor.profile.addProfiles([user.profile]);
      }
    },
  }
);
