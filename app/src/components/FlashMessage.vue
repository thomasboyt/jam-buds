<template>
  <transition name="message-slide">
    <div v-if="activeFlashMessage" class="message-box" @click="handleClose">
      {{ activeFlashMessage }}
    </div>
  </transition>
</template>

<script>
export default {
  computed: {
    activeFlashMessage() {
      return this.$store.state.flashMessage;
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
@import '../../styles/mixins.scss';
@import '../../styles/z-index.scss';

.message-box {
  background: $black;
  color: white;
  z-index: $z-flash-message;
  cursor: pointer;
  border-radius: 5px;

  position: fixed;
  top: calc(100% - 160px);
  left: calc(50% + #{$sidebar-width / 2});
  transform: translateX(-50%);
  padding: 15 30px;
}

.message-slide-enter,
.message-slide-leave-active {
  opacity: 0;
}

.message-slide-enter {
  top: 100%;
}

.message-slide-enter-active {
  transition: all 0.1s ease-out;
}
.message-slide-leave-active {
  transition: all 0.2s ease-out;
}
</style>