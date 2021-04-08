<template>
  <modal title="notifications" :is-open="isOpen">
    <template v-if="notifications.length > 0">
      <div class="button-row">
        <jb-button class="mark-read-button" @click="handleMarkAllRead">
          mark all read
        </jb-button>
      </div>

      <ul>
        <li v-for="notification of notifications" :key="notification.id">
          <nuxt-link
            :class="{ read: notification.seen }"
            :to="notification.url"
            @click.native="handleClickNotification(notification)"
          >
            {{ notification.body }}
            <div class="timestamp">
              {{ formatTimestamp(notification.timestamp) }}
            </div>
          </nuxt-link>
        </li>
      </ul>
    </template>

    <div v-else class="placeholder">No new notifications!</div>
  </modal>
</template>

<script>
import Modal from '../Modal.vue';
import JbButton from '../lib/JbButton.vue';
import formatDistanceToNowStrict from 'date-fns/formatDistanceToNowStrict';
import subDays from 'date-fns/subDays';
import isBefore from 'date-fns/isBefore';

export default {
  components: { Modal, JbButton },

  fetch() {
    return this.$store.dispatch('notifications/load');
  },

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
    formatTimestamp(timestamp) {
      const date = new Date(timestamp);
      const yday = subDays(new Date(), 1);
      if (isBefore(date, yday)) {
        // if >24 hours ago: use absolute timestamp. add year to it if it's >180
        // days old (kinda arbitrary number)
        const reallyOld = isBefore(date, subDays(new Date(), 180));
        return date.toLocaleDateString(undefined, {
          year: reallyOld ? 'numeric' : undefined,
          month: 'short',
          day: 'numeric',
        });
      } else {
        // use relative timestamp
        const relativeTime = formatDistanceToNowStrict(date);
        return `${relativeTime} ago`;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
@import '~/assets/styles/mixins.scss';

.button-row {
  text-align: center;
  margin-bottom: 16px;
}

.mark-read-button {
  border-width: 1px;
  padding: 8px 12px;
}

ul li a {
  color: #e1e1e1;
  display: block;
  background: rgba(0, 0, 0, 0.4);
  padding: 10px;
  margin-bottom: 8px;
  text-decoration: none;

  &.read {
    color: #bbb;
  }

  .timestamp {
    font-size: 12px;
    margin-top: 5px;

    @media (min-width: $breakpoint-small) {
      font-size: 14px;
    }
  }
}

.placeholder {
  text-align: center;
  margin-top: 100px;
}
</style>
