<template>
  <audio :src="url" autoPlay ref="player" />
</template>

<script>
export default {
  props: ['url', 'isPlaying'],

  watch: {
    isPlaying(newVal) {
      if (newVal) {
        this.$refs.player.play();
      } else {
        this.$refs.player.pause();
      }
    },
  },

  mounted() {
    this.$refs.player.addEventListener('ended', this.handleEnded);
  },

  beforeDestroy() {
    this.$refs.player.removeEventListener('ended', this.handleEnded);
  },

  methods: {
    handleEnded() {
      this.$emit('ended');
    },
  },
};
</script>
