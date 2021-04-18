import { getterTree, mutationTree, actionTree } from 'typed-vuex';
import { ApiSchema } from '~/api/_helpers';

type Notification = ApiSchema<'NotificationItem'>;

interface NotificationsState {
  items: Notification[];
}

export const state = (): NotificationsState => {
  return {
    items: [],
  };
};

export const getters = getterTree(state, {
  hasUnreadNotifications(state): boolean {
    return state.items.some((item) => !item.seen);
  },
});

export const mutations = mutationTree(state, {
  setNotifications(
    state,
    { notifications }: { notifications: Notification[] }
  ) {
    state.items = notifications;
  },
  markRead(state, id: number) {
    state.items.find((item) => item.id === id)!.seen = true;
  },
  markAllRead(state) {
    state.items = state.items.map((item) => {
      return { ...item, seen: true };
    });
  },
});

export const actions = actionTree(
  { state, mutations, getters },
  {
    async load(context): Promise<void> {
      const resp = await this.$axios({
        url: '/notifications',
        method: 'GET',
      });

      const data = resp.data as ApiSchema<'NotificationItem'>[];

      context.commit('setNotifications', { notifications: data });
    },

    async readAll(context): Promise<void> {
      context.commit('markAllRead');

      try {
        await this.$axios({
          url: '/notifications/mark-all-read',
          method: 'POST',
        });
      } catch (err) {
        this.app.$accessor.showErrorModal(null);
        throw err;
      }
    },

    async read(context, { id }: { id: number }): Promise<void> {
      context.commit('markRead', id);

      // don't show an error since it's easier to just ignore...
      await this.$axios({
        method: 'POST',
        url: `/notifications/${id}/read`,
      });
    },
  }
);
