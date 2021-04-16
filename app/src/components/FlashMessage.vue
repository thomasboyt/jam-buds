<template>
  <transition name="message-slide">
    <div v-if="activeFlashMessage" class="message-box" @click="handleClose">
      <div class="message-box-content">
        {{ activeFlashMessage }}
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  computed: {
    activeFlashMessage() {
      return this.$accessor.flashMessage;
    },
  },

  methods: {
    handleClose() {
      this.$store.dispatch('clearFlashMessage');
    },
  },
};
</script>

<style lang="scss" scoped>
@import '~/assets/styles/mixins.scss';
@import '~/assets/styles/z-index.scss';

.message-box {
  background: $black;
  color: white;
  z-index: $z-flash-message;
  cursor: pointer;
  border-radius: 5px;

  position: fixed;
  // XXX: this is a pretty brittle magic number :\
  top: calc(100% - 160px);
  transform: translateX(-50%);

  left: calc(50%);
  width: 80%;
  @media (min-width: $breakpoint-small) {
    left: calc(50% + #{$sidebar-width / 2});
    width: auto;
  }
}

.message-box-content {
  text-align: center;
  padding: 15px 30px;
}

.message-slide-enter,
.message-slide-leave-active {
  opacity: 0;
}

.message-slide-enter {
  top: 100%;
}

.message-slide-enter-active {
  transition: all 0.15s cubic-bezier(0, 0, 0.2, 1);
}
.message-slide-leave-active {
  transition: all 0.2s linear;
}
</style>
