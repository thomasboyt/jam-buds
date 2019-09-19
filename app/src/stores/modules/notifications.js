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

    async clear(context) {
      context.commit('setNotifications', { notifications: [] });

      try {
        await this.$axios({
          url: '/notifications/mark-all-read',
          method: 'POST',
        });
      } catch (err) {
        context.commit('showErrorModal', null, { root: true });
        throw err;
      }
    },
  },
};

export default notifications;
