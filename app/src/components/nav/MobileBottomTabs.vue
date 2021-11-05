<template>
  <div class="mobile-bottom-tabs">
    <ul class="tabs">
      <li
        v-for="tab in tabs"
        :key="tab.name"
        :class="{ active: activeTab === tab.link }"
      >
        <nuxt-link :to="tab.link" @click.native="setActiveTab(tab.link)">
          <icon :glyph="tab.icon" />
          <div>{{ tab.name }}</div>
        </nuxt-link>
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Icon from '~/components/Icon.vue';

import homeIcon from '~/assets/home.svg?sprite';
import profileIcon from '~/assets/profile.svg?sprite';
import globeIcon from '~/assets/globe.svg?sprite';
import settingsIcon from '~/assets/settings.svg?sprite';

interface Tab {
  name: string;
  link: string;
  icon: string;
}

export default Vue.extend({
  components: { Icon },

  computed: {
    tabs(): Tab[] {
      const currentUserName = this.$accessor.currentUser.user!.name;
      return [
        { name: 'Feed', link: '/', icon: homeIcon },
        {
          name: 'Profile',
          link: `/users/${currentUserName}`,
          icon: profileIcon,
        },
        { name: 'Public', link: '/public-feed', icon: globeIcon },
        { name: 'Settings', link: '/settings', icon: settingsIcon },
      ];
    },

    activeTab(): string {
      return this.$accessor.activeBottomTab;
    },
  },

  methods: {
    setActiveTab(path: string) {
      this.$accessor.setActiveTab(path);
    },
  },
});
</script>

<style lang="scss" scoped>
@import '~/assets/styles/mixins.scss';
@import '~/assets/styles/z-index.scss';

.mobile-bottom-tabs {
  position: fixed;
  z-index: $z-mobile-tabbar;

  bottom: 0;
  width: 100%;
  height: var(--mobile-bottom-bar-height);
  padding-bottom: env(safe-area-inset-bottom);

  background: $black;

  @media (min-width: $breakpoint-small) {
    display: none;
  }
}

.tabs {
  list-style: none;
  margin: 0;
  padding: 0;
  height: 100%;

  display: flex;
  justify-content: center;

  li {
    flex: 0 0 80px;
    margin: 0 5px;
    height: 100%;
    text-align: center;

    a {
      width: 100%;
      height: 100%;
      display: flex;
      flex-flow: column;
      justify-content: center;

      & > * {
        flex: 0 0 auto;
      }

      color: #ccc;
      font-size: 12px;
      text-decoration: none;

      .icon {
        display: block;
        height: 20px;
        margin: 0 auto;
      }
    }

    &.active a {
      color: white;
    }
  }
}
</style>
