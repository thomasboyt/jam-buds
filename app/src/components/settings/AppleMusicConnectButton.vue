<template>
  <settings-button @click="handleConnectAppleMusic"
    >connect to apple music</settings-button
  >
</template>

<script>
/* global MusicKit */

import SettingsButton from './SettingsButton.vue';

export default {
  components: { SettingsButton },

  methods: {
    async handleConnectAppleMusic() {
      await MusicKit.getInstance().authorize();
      this.$store.commit('authorizedAppleMusic');
      this.$store.commit('hideConnectStreamingBanner');
      this.$emit('connectedAppleMusic');
    },
  },
};
</script>
