<template>
  <div v-if="hasSpotify || hasAppleMusic">
    <p>you're connected to {{ serviceName }}</p>
    <p>
      <settings-button @click="handleDisconnect" :is-saving="isDisconnecting"
        >disconnect</settings-button
      >
    </p>
  </div>
  <div v-else>
    <p>
      the best way to listen on jam buds is to use a spotify or apple music
      account, if you have one.
    </p>

    <p class="button-group">
      <spotify-connect-button redirect="/settings" />

      <apple-music-connect-button />
    </p>
    <p>
      nb: i've got all the love in the world for all of y'all on google play
      music, tidal, and... idk, whatever garbage streaming service amazon has?
      unfortunately, none of these services have APIs for in-browser playback.
    </p>
  </div>
</template>

<script>
/* global MusicKit */

import { mapState } from 'vuex';

import SpotifyConnectButton from './SpotifyConnectButton.vue';
import AppleMusicConnectButton from './AppleMusicConnectButton.vue';
import SettingsButton from './SettingsButton.vue';

export default {
  components: { SettingsButton, AppleMusicConnectButton, SpotifyConnectButton },

  data() {
    return {
      isDisconnecting: false,
    };
  },

  computed: {
    ...mapState({
      hasSpotify: (state) => state.streaming.hasSpotify,
      hasAppleMusic: (state) => state.streaming.hasAppleMusic,
      serviceName: (state) =>
        state.streaming.hasSpotify ? 'Spotify' : 'Apple Music',
    }),
  },

  methods: {
    handleDisconnect() {
      if (this.hasSpotify) {
        this.handleDisconnectSpotify();
      } else {
        this.handleDisconnectAppleMusic();
      }
    },

    async handleDisconnectAppleMusic() {
      await MusicKit.getInstance().unauthorize();
      this.$store.commit('unauthorizedAppleMusic');
    },

    async handleDisconnectSpotify() {
      this.isDisconnecting = true;

      try {
        await this.$axios({
          url: '/spotify-token',
          method: 'DELETE',
        });
      } catch (err) {
        this.$store.commit('showErrorModal');
        throw err;
      }

      this.$store.commit('disconnectedSpotify');
      this.isDisconnecting = false;
    },
  },
};
</script>

<style lang="scss" scoped>
.button-group {
  display: flex;
  flex-wrap: wrap;
  margin: -10px -10px 1em -10px;

  /deep/ .settings-button {
    flex: 0 0 auto;
    margin: 10px;
  }
}
</style>
