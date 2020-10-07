<template>
  <div v-if="streamingService">
    <div class="button-group">
      <jb-button @click="handleDisconnect" :disabled="isDisconnecting">
        <template>disconnect</template>
      </jb-button>
    </div>
  </div>
  <div v-else>
    <div class="button-group">
      <spotify-connect-button
        redirect="/settings"
        @connected="handleConnected"
      />
      <apple-music-connect-button @connected="handleConnected" />
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
import JbButton from '~/components/lib/JbButton.vue';

export default {
  components: {
    SpotifyConnectButton,
    AppleMusicConnectButton,
    JbButton,
  },

  head() {
    return {
      title: 'streaming settings',
    };
  },

  data() {
    return {
      isDisconnecting: false,
    };
  },

  computed: {
    ...mapState({
      streamingService: (state) => state.streaming.service,
      isWebView: (state) => state.isWebView,
      webPlayerEnabled: (state) => state.streaming.webPlayerEnabled,
      supports: (state) => state.streaming.supports,
    }),
    serviceName() {
      return this.$store.getters.streamingServiceName;
    },
  },

  methods: {
    handleDisconnect() {
      if (this.streamingService === 'spotify') {
        this.handleDisconnectSpotify();
      } else if (this.streamingService === 'appleMusic') {
        this.handleDisconnectAppleMusic();
      }
      this.$store.dispatch('unsetStreamingService');
    },

    async handleDisconnectAppleMusic() {
      if (this.supports.appleMusic) {
        if (this.webPlayerEnabled) {
          await MusicKit.getInstance().unauthorize();
        } else {
          // TODO: disconnect native integration
        }
      }
    },

    async handleDisconnectSpotify() {
      if (this.supports.spotify) {
        if (this.webPlayerEnabled) {
          try {
            await this.$axios({
              url: '/spotify-token',
              method: 'DELETE',
            });
          } catch (err) {
            this.$store.commit('showErrorModal');
            throw err;
          }

          this.isDisconnecting = false;
        } else {
          // TODO: disconnect native integration
        }
      }
      this.isDisconnecting = true;
    },

    handleConnected() {
      this.$router.push('/settings');
      this.$store.dispatch('setFlashMessage', {
        message: `You've set ${this.serviceName} as your streaming service.`,
        clearMs: 4000,
      });
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

  ::v-deep .jb-button {
    flex: 0 0 auto;
    width: 250px;
    margin: 10px;
  }
}

.streaming-disclaimer {
  font-size: 14px;
}
</style>