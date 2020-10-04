<template>
  <div v-if="hasSpotify || hasAppleMusic">
    <div class="button-group">
      <settings-button @click="handleDisconnect" :is-saving="isDisconnecting">
        <template>disconnect</template>
      </settings-button>
    </div>
  </div>
  <div v-else>
    <div class="button-group">
      <spotify-connect-button redirect="/settings" />
      <apple-music-connect-button />
    </div>
    <p class="streaming-disclaimer">
      (not using either of these? while we'd love to support more services,
      we're not aware of any others that have an API for in-browser or native
      mobile playback.)
    </p>
  </div>
</template>

<script>
/* global MusicKit */

import { mapState } from 'vuex';
import SpotifyConnectButton from '~/components/settings/SpotifyConnectButton.vue';
import AppleMusicConnectButton from '~/components/settings/AppleMusicConnectButton.vue';
import SettingsButton from '~/components/settings/SettingsButton.vue';

export default {
  components: {
    SpotifyConnectButton,
    AppleMusicConnectButton,
    SettingsButton,
  },

  head() {
    return {
      title: 'streaming settings',
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
      this.$store.commit('removeAppleMusic');
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

      this.$store.commit('removeSpotify');
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
  justify-content: center;

  ::v-deep .settings-button {
    flex: 0 0 auto;
    width: 250px;
    margin: 10px;
  }
}

.streaming-disclaimer {
  font-size: 14px;
}
</style>