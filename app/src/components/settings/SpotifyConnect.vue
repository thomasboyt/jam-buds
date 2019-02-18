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

    <p>
      <settings-button tag="a" :href="spotifyConnectLink"
        >connect to spotify</settings-button
      >

      <settings-button @click="handleConnectAppleMusic"
        >connect to apple music</settings-button
      >
    </p>
  </div>
</template>

<script>
/* global MusicKit */

import { mapState } from 'vuex';

import SettingsButton from './SettingsButton.vue';

export default {
  components: { SettingsButton },

  props: ['redirect'],

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
    spotifyConnectLink() {
      return `/auth/spotify-connect?redirect=${this.redirect}`;
    },
  },

  methods: {
    async handleConnectAppleMusic() {
      await MusicKit.getInstance().authorize();
      this.$store.commit('authorizedAppleMusic');
    },

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
