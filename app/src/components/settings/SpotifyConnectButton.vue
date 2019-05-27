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

  mounted() {
    const failed = 'failed-spotify-connect' in this.$route.query;
    if (failed) {
      // remove "failed-spotify-connect" from path to prevent re-triggering
      this.$router.replace(this.$route.path);

      alert(
        "Error connecting Spotify: You must have a premium (paid) Spotify account to stream to it from Jam Buds.\n\nSorry, I don't make the rules :("
      );
    }
  },
};
</script>
