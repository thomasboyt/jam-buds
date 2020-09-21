<template>
  <modal title="notifications" :is-open="isOpen" @close="handleCloseModal">
    <p>
      {{ notifications.length }} new
      {{ notifications.length === 1 ? 'update' : 'updates' }} since your last
      visit!
    </p>

    <ul :style="{ marginBottom: '0px' }">
      <li v-for="notification of notifications" :key="notification.id">
        <nuxt-link
          :to="`/users/${notification.user.name}`"
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
    handleCloseModal() {
      this.$store.dispatch('notifications/clear');
    },
  },
};
</script>

<style lang="scss" scoped>
@import '~/assets/styles/mixins.scss';

ul {
  list-style-type: none;
  padding-left: 0;

  li a {
    color: #e1e1e1;
    display: block;
    background: rgba(0, 0, 0, 0.4);
    padding: 10px;
    margin-bottom: 4px;
    text-decoration: none;

    @media (min-width: $breakpoint-small) {
      font-size: 16px;
      margin-bottom: 8px;
    }
  }
}
</style>
