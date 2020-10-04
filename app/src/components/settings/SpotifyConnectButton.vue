<template>
  <jb-button tag="a" :href="spotifyConnectLink">connect to spotify</jb-button>
</template>

<script>
import JbButton from '../lib/JbButton.vue';

export default {
  components: { JbButton },

  props: ['redirect'],

  computed: {
    spotifyConnectLink() {
      return `/auth/spotify-connect?redirect=${this.redirect}`;
    },
  },

  mounted() {
    const error = this.$route.query.spotifyAuthError;
    if (error) {
      // remove error from path to prevent re-triggering
      this.$router.replace(this.$route.path);

      if (error === 'nonPremium') {
        this.$store.commit(
          'showErrorModal',
          "Error connecting Spotify: You must have a premium (paid) Spotify account to stream to it from Jam Buds.\n\nSorry, I don't make the rules :("
        );
      } else {
        this.$store.commit(
          'showErrorModal',
          `Unknown error connecting Spotify: ${error}`
        );
      }
    }
  },
};
</script>
