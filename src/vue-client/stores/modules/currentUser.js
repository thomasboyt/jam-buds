import apiRequest from '../../apiRequest';

const currentUser = {
  state() {
    return {};
  },

  mutations: {
    setCurrentUser(state, user) {
      Object.assign(state, user);
    }
  },

  actions: {
  },
};

export default currentUser;