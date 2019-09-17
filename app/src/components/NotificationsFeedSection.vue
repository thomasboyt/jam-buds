<template>
  <panel class="notifications-panel">
    <button class="close-button">
      <icon :glyph="closeIcon" class="close-icon" />
    </button>

    <p>
      3 new updates since your last visit!
    </p>
    <ul>
      <li>
        <strong><router-link to="/users/jeff">jeff</router-link></strong> is now
        following you
      </li>
      <li>
        <strong><router-link to="/users/alex">alex</router-link></strong> (<a
          href="#"
          >@alex_navarro</a
        >) is now on jam buds
      </li>
      <li>
        <strong><router-link to="/users/vinny">vinny</router-link></strong> is
        now following you
      </li>
    </ul>
    <!-- <div v-if="unreadNotificationCount > 0">
      <a href="#"
        >{{ unreadNotificationCount }} unread
        <span v-if="unreadNotificationCount === 1">notification</span
        ><span v-else>notifications</span></a
      >
    </div> -->
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
    unreadNotificationCount() {
      return this.$store.state.currentUser.unreadNotificationCount;
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
