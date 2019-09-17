const notifications = {
  namespaced: true,

  state() {
    return {
      items: [],
    };
  },

  mutations: {
    setNotifications(state, { notifications }) {
      state.items = notifications;
    },
  },

  actions: {
    async load(context) {
      const resp = await this.$axios({
        url: '/notifications',
        method: 'GET',
      });

      context.commit('setNotifications', { notifications: resp.data });
    },
  },
};

export default notifications;
