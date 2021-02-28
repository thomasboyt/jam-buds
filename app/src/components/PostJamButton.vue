<template>
  <jb-button
    @click="handleClick"
    class="post-jam-button"
    data-test="post-jam-button"
    button-style="page-action"
  >
    <slot />
  </jb-button>
</template>

<script>
import JbButton from './lib/JbButton';

export default {
  components: { JbButton },

  methods: {
    handleClick() {
      this.$emit('click');
    },
  },
};
</script>

<style lang="scss" scoped>
@import '~/assets/styles/mixins.scss';
@import '~/assets/styles/z-index.scss';

button.post-jam-button {
  padding: 10px 15px;
}

@media (max-width: $breakpoint-small) {
  button.post-jam-button {
    position: fixed;
    bottom: calc(20px + var(--mobile-bottom-bar-height));
    right: 20px;
    z-index: $z-floating-button;

    padding: 15px 20px;
    box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);

    transition: 0.2s bottom cubic-bezier(0, 0, 0.2, 1);
  }

  body.with-audio-player button.post-jam-button {
    bottom: calc(
      20px + var(--mobile-bottom-bar-height) + #{$player-bar-height}
    );
  }
}
</style>
