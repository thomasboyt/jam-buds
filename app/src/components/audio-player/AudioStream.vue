<template>
  <audio :src="url" autoPlay ref="player"></audio>
</template>

<script>
export default {
  props: ['url', 'isPlaying'],

  mounted() {
    this.$refs.player.addEventListener('ended', this.handleEnded);
  },

  beforeDestroy() {
    this.$refs.player.removeEventListener('ended', this.handleEnded);
  },

  watch: {
    isPlaying(newVal) {
      if (newVal) {
        this.$refs.player.play();
      } else {
        this.$refs.player.pause();
      }
    },
  },

  methods: {
    handleEnded() {
      this.$emit('ended');
    },
  },
};
</script>
