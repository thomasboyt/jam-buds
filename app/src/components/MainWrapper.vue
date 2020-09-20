<template>
  <div class="container">
    <sidebar :open="isSidebarOpen" />
    <div v-if="isSidebarOpen" class="modal-overlay" @click="handleClickSidebarOverlay" />

    <div :class="['main', { 'with-sidebar': authenticated }]">
      <!-- TODO: remove this? v -->
      <logged-out-header v-if="!authenticated" />

      <div class="main-inner">
        <slot />
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import getCSSVariablesFromColorScheme from '../util/getCSSVariablesFromColorScheme';
import { defaultColorScheme } from '../util/gradients';
import LoggedOutHeader from './LoggedOutHeader.vue';
import Sidebar from './nav/Sidebar.vue';

export default {
  components: {
    LoggedOutHeader,
    Sidebar,
  },

  props: ['colorScheme', 'withColorSchemeOverride'],

  head() {
    return {
      style: [
        {
          vmid: 'color-scheme',
          innerHTML: `
          :root {
            --theme-body-background: ${this.cssTheme['--theme-body-background']};
            --theme-text-color: ${this.cssTheme['--theme-text-color']};
          }
        `,
        },
      ],
    };
  },

  computed: {
    ...mapState({
      currentUserScheme: (state) => state.currentUser.colorScheme,
      authenticated: (state) => state.auth.authenticated,
      isSidebarOpen: (state) => state.isSidebarOpen,
    }),

    cssTheme() {
      let colorScheme;

      if (this.withColorSchemeOverride) {
        colorScheme = this.colorScheme || defaultColorScheme;
      } else {
        colorScheme = this.currentUserScheme || defaultColorScheme;
      }

      return getCSSVariablesFromColorScheme(colorScheme);
    },
  },

  methods: {
    handleClickSidebarOverlay() {
      this.$store.commit('closeSidebar');
    },
  },
};
</script>

<style lang="scss">
@import '~/assets/styles/mixins.scss';

.main {
  background: var(--theme-body-background);
  background-attachment: fixed;
  color: var(--theme-text-color);

  a {
    color: var(--theme-text-color);
  }

  @media (min-width: $breakpoint-small) {
    &.with-sidebar {
      margin-left: $sidebar-width;
    }
  }
}
</style>
