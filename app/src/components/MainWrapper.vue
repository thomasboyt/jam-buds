<template>
  <div class="container">
    <mobile-header />
    <mobile-bottom-tabs v-if="authenticated" />

    <sidebar />

    <div :class="['main', { 'with-sidebar': authenticated }]">
      <logged-out-header v-if="!authenticated" />

      <div class="main-inner">
        <div class="error-page" v-if="fetchState && fetchState.error">
          <p v-if="errorCode === 404">The requested resource was not found.</p>
          <p v-else>An unexpected error occurred while loading this page.</p>
        </div>
        <slot v-else />
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import getCSSVariablesFromColorScheme from '../util/getCSSVariablesFromColorScheme';
import LoggedOutHeader from './LoggedOutHeader.vue';
import Sidebar from './nav/Sidebar.vue';
import MobileHeader from '~/components/nav/MobileHeader.vue';
import MobileBottomTabs from '~/components/nav/MobileBottomTabs.vue';

export default {
  components: {
    LoggedOutHeader,
    MobileHeader,
    MobileBottomTabs,
    Sidebar,
  },

  props: ['withColorSchemeOverride', 'fetchState'],

  head() {
    if (!process.server) {
      // only set css variables in head for SSR build
      return;
    }

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
      authenticated: (state) => state.auth.authenticated,
    }),

    cssTheme() {
      const scheme = this.$store.getters['colorScheme/currentColorScheme'];
      return getCSSVariablesFromColorScheme(scheme);
    },

    errorCode() {
      return this.fetchState.error.response?.status;
    },
  },

  watch: {
    cssTheme(cssTheme) {
      this.updateTheme(cssTheme);
    },
  },

  created() {
    if (this.withColorSchemeOverride) {
      this.$store.commit('colorScheme/enableOverride');
    } else {
      // reset back to default color scheme
      this.$store.commit('colorScheme/disableOverride');
    }
  },

  mounted() {
    this.updateTheme(this.cssTheme);
  },

  methods: {
    handleClickSidebarOverlay() {
      this.$store.commit('closeSidebar');
    },

    updateTheme(cssTheme) {
      document.documentElement.style.setProperty(
        '--theme-body-background',
        cssTheme['--theme-body-background']
      );
      document.documentElement.style.setProperty(
        '--theme-text-color',
        cssTheme['--theme-text-color']
      );
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

.error-page {
  text-align: center;
  margin-top: 200px;
}
</style>
