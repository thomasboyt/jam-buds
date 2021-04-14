<template>
  <jb-button @click="handleConnectAppleMusic">
    listen with apple music
  </jb-button>
</template>

<script>
/* global MusicKit */

import JbButton from '../lib/JbButton.vue';

export default {
  components: { JbButton },

  methods: {
    async handleConnectAppleMusic() {
      const { webPlayerEnabled, supports } = this.$store.state.streaming;
      if (supports.appleMusic) {
        if (webPlayerEnabled) {
          await MusicKit.getInstance().authorize();
        } else {
          // TODO: native connection
        }
      }
      this.$store.dispatch('streaming/updateStreamingService', 'appleMusic');
      this.$emit('connected');
    },
  },
};
</script>
