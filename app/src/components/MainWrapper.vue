<template>
  <div :class="['main', { 'with-sidebar': withSidebar }]" :style="cssTheme">
    <div class="main-inner">
      <slot />
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import getCSSVariablesFromColorScheme from '../util/getCSSVariablesFromColorScheme';

export default {
  props: ['colorScheme', 'withSidebar'],

  computed: {
    ...mapState({
      currentUserScheme: (state) => state.currentUser.colorScheme,
    }),

    cssTheme() {
      let colorScheme;

      if (this.colorScheme) {
        colorScheme = this.colorScheme;
      } else if (this.currentUserScheme) {
        colorScheme = this.currentUserScheme;
      } else {
        // marketing site...???
        colorScheme = {
          backgroundColor: 'hotpink',
          textColor: 'black',
        };
      }

      return getCSSVariablesFromColorScheme(colorScheme);
    },
  },
};
</script>

<style lang="scss">
@import '../../styles/mixins.scss';

.main {
  background-color: var(--theme-body-background-color);
  color: var(--theme-text-color);

  a {
    color: var(--theme-text-color);
  }

  svg {
    fill: var(--theme-text-color);
    stroke: var(--theme-text-color);
    color: var(--theme-text-color);
  }

  @media (min-width: $breakpoint-small) {
    &.with-sidebar {
      margin-left: $sidebar-width;
    }
  }
}
</style>
