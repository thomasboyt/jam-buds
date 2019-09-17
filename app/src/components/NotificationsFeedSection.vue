<template>
  <panel class="notifications-panel">
    <button class="close-button">
      <icon :glyph="closeIcon" class="close-icon" />
    </button>

    <p>
      {{ notifications.length }} new
      {{ notifications.length === 1 ? 'update' : 'updates' }} since your last
      visit!
    </p>

    <ul>
      <li v-for="notification of notifications" :key="notification.id">
        <strong
          ><router-link :to="`/users/${notification.user.name}`">{{
            notification.user.name
          }}</router-link></strong
        >
        is now following you.
      </li>
    </ul>
  </panel>
</template>

<style lang="scss" scoped></style>

<script>
import Panel from './Panel.vue';
import Icon from './Icon.vue';
import closeIcon from '../../assets/close.svg';

export default {
  components: { Panel, Icon },

  data() {
    return { closeIcon };
  },

  computed: {
    notifications() {
      return this.$store.state.notifications.items;
    },
  },
};
</script>

<style lang="scss" scoped>
.notifications-panel {
  position: relative;

  ul {
    margin-left: 0;
    padding-left: 0;
    list-style-position: inside;
  }

  li {
    margin-bottom: 4px;
  }
}

.close-button {
  position: absolute;
  right: 0;
  top: 8px;

  .close-icon {
    width: 30px;
    height: 30px;
  }
}
</style>
