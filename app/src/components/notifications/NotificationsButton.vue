<template>
  <nuxt-link
    class="notifications-button"
    :aria-label="label"
    :to="{ query: { modal: 'notifications' } }"
    append
  >
    <icon :glyph="notificationsIcon" />
    <div v-show="hasUnreadNotifications" class="notifications-dot"></div>
  </nuxt-link>
</template>

<script>
import { mapGetters } from 'vuex';
import Icon from '../Icon.vue';
const notificationsIcon = require('~/assets/bell.svg');

export default {
  components: { Icon },

  data() {
    return {
      notificationsIcon,
    };
  },

  computed: {
    ...mapGetters('notifications', ['hasUnreadNotifications']),
    label() {
      return this.hasUnreadNotifications
        ? 'Unread notifications'
        : 'Past notifications';
    },
  },
};
</script>

<style lang="scss" scoped>
@import '~/assets/styles/mixins.scss';

.notifications-button {
  width: 36px;
  height: 36px;
  position: relative;
}

.notifications-dot {
  position: absolute;
  right: 4px;
  bottom: 5px;
  background: red;
  border: 1px $black solid;
  width: 8px;
  height: 8px;
  border-radius: 9999px;
}
</style>