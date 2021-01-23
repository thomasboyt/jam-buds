<template>
  <div class="modal-overlay" @click="handleClickOverlay">
    <slot />
  </div>
</template>

<script>
export default {
  props: ['zIndex'],

  methods: {
    handleClickOverlay() {
      this.$emit('click');
    },
  },
};
</script>

<style lang="scss" scoped>
@import '~/assets/styles/z-index.scss';

.modal-overlay {
  z-index: $z-modal-overlay;

  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.3);
}
</style>
