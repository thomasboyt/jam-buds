<template>
  <div :class="['main', { 'with-sidebar': withSidebar }]" :style="cssTheme">
    <logged-out-header v-if="!authenticated" />

    <div class="main-inner">
      <slot />
    </div>
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
  props: ['colorScheme', 'withSidebar'],

  computed: {
    ...mapState({
      currentUserScheme: (state) => state.currentUser.colorScheme,
      authenticated: (state) => state.auth.authenticated,
    }),

    cssTheme() {
      let colorScheme;

      if (this.colorScheme) {
        colorScheme = this.colorScheme;
      } else if (this.currentUserScheme) {
        colorScheme = this.currentUserScheme;
      } else {
        colorScheme = defaultColorScheme;
      }

      return getCSSVariablesFromColorScheme(colorScheme);
    },
  },
};
</script>

<style lang="scss">
@import '../../styles/mixins.scss';

.main {
  background: var(--theme-body-background);
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
