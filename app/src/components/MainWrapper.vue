<template>
  <div :class="['main', { 'with-sidebar': withSidebar }]">
    <logged-out-header v-if="!authenticated" />

    <div class="main-inner">
      <slot />
    </div>

    <style>
      :root {
        --theme-body-background: {{cssTheme[ '--theme-body-background' ]}};
        --theme-text-color: {{cssTheme[ '--theme-text-color' ]}};
      }
    </style>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import getCSSVariablesFromColorScheme from '../util/getCSSVariablesFromColorScheme';
import { defaultColorScheme } from '../util/gradients';
import LoggedOutHeader from './LoggedOutHeader.vue';

export default {
  components: {
    LoggedOutHeader,
  },
  props: ['colorScheme', 'withSidebar', 'withColorSchemeOverride'],

  computed: {
    ...mapState({
      currentUserScheme: (state) => state.currentUser.colorScheme,
      authenticated: (state) => state.auth.authenticated,
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
