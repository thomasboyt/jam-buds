<template>
  <jb-button @click="handleConnectAppleMusic">
    connect to apple music
  </jb-button>
</template>

<script>
/* global MusicKit */

import JbButton from '../lib/JbButton.vue';

export default {
  components: { JbButton },

  methods: {
    async handleConnectAppleMusic() {
      await MusicKit.getInstance().authorize();
      this.$store.commit('loadedAppleMusic', true);
      this.$store.commit('hideConnectStreamingBanner');
      this.$emit('connectedAppleMusic');
    },
  },
};
</script>
