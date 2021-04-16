<template>
  <transition name="audio-player-open">
    <audio-player-bar v-if="currentSong" />
  </transition>
</template>

<script>
import AudioPlayerBar from './AudioPlayerBar.vue';

export default {
  components: {
    AudioPlayerBar,
  },

  computed: {
    currentSong() {
      return this.$accessor.playback.currentSong;
    },
  },
};
</script>
