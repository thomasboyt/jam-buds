<template>
  <jb-button tag="button" @click="handleConnect">listen with spotify</jb-button>
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
        this.$accessor.showErrorModal(
          "Error connecting Spotify: You must have a premium (paid) Spotify account to stream to it from Jam Buds.\n\nSorry, I don't make the rules :("
        );
      } else {
        this.$accessor.showErrorModal(
          `Unknown error connecting Spotify: ${error}`
        );
      }
    }
  },

  methods: {
    handleConnect() {
      const { webPlayerEnabled, supports } = this.$accessor.streaming;
      if (supports.spotify) {
        if (webPlayerEnabled) {
          document.location = this.spotifyConnectLink;
          return;
        } else {
          // TODO: native connection
        }
      }
      this.$store.dispatch('streaming/updateStreamingService', 'spotify');
      this.$emit('connected');
    },
  },
};
</script>
