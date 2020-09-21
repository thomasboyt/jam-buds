<template>
  <modal title="notifications" :is-open="isOpen">
    <div class="button-row">
      <button @click="handleMarkAllRead">mark all read</button>
    </div>
    <ul>
      <li v-for="notification of notifications" :key="notification.id">
        <nuxt-link
          :class="{read: notification.read}"
          :to="`/users/${notification.user.name}`"
          @click.native="handleClickNotification(notification)"
        >{{notification.user.name}} is now following you.</nuxt-link>
      </li>
    </ul>
  </modal>
</template>

<script>
import Modal from './Modal.vue';

export default {
  components: { Modal },

  computed: {
    notifications() {
      return this.$store.state.notifications.items;
    },
    isOpen() {
      return this.$route.query.modal === 'notifications';
    },
  },

  methods: {
    handleMarkAllRead() {
      this.$store.dispatch('notifications/readAll');
    },
    handleClickNotification(notification) {
      this.$store.dispatch('notifications/read', { id: notification.id });
    },
  },
};
</script>

<style lang="scss" scoped>
@import '~/assets/styles/mixins.scss';

.button-row {
  text-align: center;
  margin-bottom: 16px;

  button {
    border: 1px #e1e1e1 solid;
    border-radius: 9999px;
    color: #e1e1e1;
    padding: 8px 12px;
  }
}

ul {
  list-style-type: none;
  padding-left: 0;
  margin: 0;

  li a {
    color: #e1e1e1;
    display: block;
    background: rgba(0, 0, 0, 0.4);
    padding: 10px;
    margin-bottom: 4px;
    text-decoration: none;

    &.read {
      color: #bbb;
    }

    @media (min-width: $breakpoint-small) {
      font-size: 16px;
      margin-bottom: 8px;
    }
  }
}
</style>
