<template>
  <transition name="audio-player-open">
    <audio-player-bar v-if="currentSong" />
  </transition>
</template>

<script lang="ts">
import Vue from 'vue';
import AudioPlayerBar from './AudioPlayerBar.vue';

export default Vue.extend({
  components: {
    AudioPlayerBar,
  },

  computed: {
    currentSong() {
      return this.$accessor.playback.currentSong;
    },
  },
});
</script>
