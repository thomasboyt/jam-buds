<template>
  <settings-button tag="a" :href="spotifyConnectLink"
    >connect to spotify</settings-button
  >
</template>

<script>
import SettingsButton from './SettingsButton.vue';

export default {
  components: { SettingsButton },

  props: ['redirect'],

  computed: {
    spotifyConnectLink() {
      return `/auth/spotify-connect?redirect=${this.redirect}`;
    },
  },
};
</script>
