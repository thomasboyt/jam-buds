<template>
  <component
    :is="component"
    :class="rowClass"
    v-bind="$attrs"
    v-on="$listeners"
  >
    <slot />
  </component>
</template>

<script>
export default {
  inheritAttrs: false,

  props: ['component', 'canPlay', 'isLink'],

  computed: {
    rowClass() {
      return {
        'playlist-item-row': true,
        'can-play': this.canPlay,
        'is-link': this.isLink,
      };
    },
  },
};
</script>

<style lang="scss" scoped>
@import '~/assets/styles/mixins.scss';

.playlist-item-row {
  padding: 10px;
  margin: 0 -10px 10px -10px;

  display: flex;
  align-items: center;
  color: var(--theme-text-color);
  text-decoration: none;

  &:hover {
    &.can-play {
      cursor: pointer;
    }
    &.is-link {
      background: rgba(0, 0, 0, 0.1);
      cursor: pointer;
    }
  }

  @media (max-width: $breakpoint-small) {
    padding: 5px;
    margin: 0 -5px 15px -5px;
  }
}
</style>
