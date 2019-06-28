<template>
  <p v-if="hasSpotify">Spotify Connected</p>
  <settings-button v-else type="button" @click="handleClick"
    >connect to spotify</settings-button
  >
</template>

<script>
import SettingsButton from '../SettingsButton.vue';

export default {
  components: { SettingsButton },

  computed: {
    hasSpotify() {
      return this.$store.state.currentUser.hasSpotify;
    },
  },

  methods: {
    handleClick() {
      window.SpotifyHandler.authorizeSpotify();
    },
  },
};
</script>
