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
    markRead(state, id) {
      state.items.find((item) => item.id === id).seen = true;
    },
    markAllRead(state) {
      state.items = state.items.map((item) => {
        return { ...item, seen: true };
      });
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

    async readAll(context) {
      context.commit('markAllRead');

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

    async read(context, { id }) {
      context.commit('markRead', id);

      // don't show an error since it's easier to just ignore...
      await this.$axios({
        method: 'POST',
        url: `/notifications/${id}/read`,
      });
    },
  },

  getters: {
    hasUnreadNotifications(state) {
      return state.items.some((item) => !item.seen);
    },
  },
};

export default notifications;
