<template>
  <transition name="audio-player-open">
    <audio-player-bar v-if="currentSong" />
  </transition>
</template>

<script>
import { mapGetters } from 'vuex';

import AudioPlayerBar from './AudioPlayerBar.vue';

export default {
  components: {
    AudioPlayerBar,
  },

  computed: {
    ...mapGetters('playback', ['currentSong']),
  },
};
</script>
