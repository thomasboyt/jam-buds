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
      hasSpotify: (state) => state.currentUser.hasSpotify,
      hasAppleMusic: (state) => state.currentUser.hasAppleMusic,
      serviceName: (state) =>
        state.currentUser.hasSpotify ? 'Spotify' : 'Apple Music',
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
          baseURL: null,
          url: '/auth/spotify-connect',
          method: 'DELETE',
        });
      } catch (err) {
        console.error(err);
        return;
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

  /deep/ .settings-button {
    flex: 0 0 auto;
    margin-left: 10px;
    &:first-child {
      margin-left: 0px;
    }
  }
}
</style>
