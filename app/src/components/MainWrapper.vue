<template>
  <div class="main" :style="cssTheme">
    <div class="main-inner">
      <slot />
    </div>
  </div>
</template>

<script>
export default {
  props: {
    colorScheme: {
      default() {
        return {
          backgroundColor: 'hotpink',
          textColor: 'black',
          linkColor: 'black',
        };
      },
    },
  },
  computed: {
    cssTheme() {
      return {
        '--theme-background-color': this.colorScheme.backgroundColor,
        '--theme-border-color': this.colorScheme.textColor,
        '--theme-text-color': this.colorScheme.textColor,
        '--theme-link-color': this.colorScheme.linkColor,
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
