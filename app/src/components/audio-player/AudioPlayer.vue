<template>
  <transition name="audio-player-open">
    <audio-player-bar v-if="nowPlaying" />
  </transition>
</template>

<script>
import { mapState } from 'vuex';

import AudioPlayerBar from './AudioPlayerBar.vue';

export default {
  components: {
    AudioPlayerBar,
  },

  computed: {
    ...mapState('playback', ['nowPlaying']),
  },
};
</script>