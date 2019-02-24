<template>
  <div class="main" :style="cssTheme">
    <div class="main-inner">
      <slot />
    </div>
  </div>
</template>

<script>
import tinycolor from 'tinycolor2';
import { mapState } from 'vuex';

function getHoverColor(color) {
  const isDark = tinycolor(color).isDark();
  if (isDark) {
    return tinycolor(color)
      .lighten()
      .toHexString();
  } else {
    return tinycolor(color)
      .darken()
      .toHexString();
  }
}

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

      return {
        '--theme-body-background-color': colorScheme.backgroundColor,
        '--theme-card-background-color': colorScheme.cardBackgroundColor,
        '--theme-card-background-color-hover': getHoverColor(
          colorScheme.cardBackgroundColor
        ),
        '--theme-border-color': colorScheme.textColor,
        '--theme-text-color': colorScheme.textColor,
        '--theme-link-color': colorScheme.textColor,
      };
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
