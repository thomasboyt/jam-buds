<template>
  <div class="main" :style="cssTheme">
    <div class="main-inner">
      <slot />
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';

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
        colorScheme = {
          backgroundColor: 'hotpink',
          textColor: 'black',
          linkColor: 'black',
        };
      }

      return {
        '--theme-background-color': colorScheme.backgroundColor,
        '--theme-border-color': colorScheme.textColor,
        '--theme-text-color': colorScheme.textColor,
        '--theme-link-color': colorScheme.linkColor,
      };
    },
  },
};
</script>

<style lang="scss">
.main {
  background: var(--theme-background-color);
  color: var(--theme-text-color);

  a {
    color: var(--theme-link-color);
  }
}
</style>
