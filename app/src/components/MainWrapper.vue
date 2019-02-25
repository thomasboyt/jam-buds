<template>
  <div class="main" :style="cssTheme">
    <div class="main-inner">
      <slot />
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import getCSSVariablesFromColorScheme from '../util/getCSSVariablesFromColorScheme';

export default {
  props: ['colorScheme'],

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
}
</style>
