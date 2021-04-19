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

<script lang="ts">
import Vue from 'vue';
import Icon from '../Icon.vue';
const notificationsIcon: string = require('~/assets/bell.svg');

export default Vue.extend({
  components: { Icon },

  data() {
    return {
      notificationsIcon,
    };
  },

  computed: {
    hasUnreadNotifications(): boolean {
      return this.$accessor.notifications.hasUnreadNotifications;
    },
    label(): string {
      return this.hasUnreadNotifications
        ? 'Unread notifications'
        : 'Past notifications';
    },
  },
});
</script>

<style lang="scss" scoped>
@import '~/assets/styles/mixins.scss';

.notifications-button {
  position: relative;
}

.notifications-dot {
  position: absolute;
  right: 6px;
  bottom: 1px;
  background: red;
  border: 1px $black solid;
  width: 8px;
  height: 8px;
  border-radius: 9999px;
}
</style>
