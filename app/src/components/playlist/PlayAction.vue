<template>
  <button
    :class="['action-button', 'play-button', { '-disabled': !canPlay }]"
    :disabled="!canPlay"
    aria-label="Play"
  >
    <icon :glyph="playIcon" />
  </button>
</template>

<script>
import Icon from '../Icon.vue';

import playIcon from '~/assets/play.svg';

export default {
  components: { Icon },

  props: ['canPlay', 'service'],

  data() {
    return {
      playIcon,
    };
  },
};
</script>

<style lang="scss" scoped>
@import '~/assets/styles/mixins.scss';

.play-button {
  box-sizing: content-box;
  border: 2px #333 solid;
  margin-left: $spacing-md;
  padding: 6px !important; // remove 2px of padding for border

  &.-disabled {
    opacity: 0.3;
  }
}
</style>
