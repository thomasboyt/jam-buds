<template>
  <div v-if="hasSpotify">
    <p>you're connected to spotify</p>
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

      <settings-button disabled>apple music coming soon</settings-button>
    </p>
  </div>
</template>

<script>
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
    }),
    spotifyConnectLink() {
      return `/auth/spotify-connect?redirect=${this.redirect}`;
    },
  },

  methods: {
    async handleDisconnect() {
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
