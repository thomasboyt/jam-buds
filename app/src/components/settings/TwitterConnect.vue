<template>
  <div v-if="twitterName" class="button-row">
    <settings-button @click="handleDisconnect" :is-saving="isDisconnecting">
      <template>disconnect</template>
    </settings-button>
  </div>

  <div v-else>
    <p>
      connecting to twitter helps you find your friends! by connecting, you can
      see folks you follow who are on jam buds, and let folks who follow you
      find you. you can also cross-post to twitter when posting a song
    </p>
    <div class="button-row">
      <twitter-connect-button redirect="/settings" />
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';

import SettingsButton from './SettingsButton.vue';
import TwitterConnectButton from './TwitterConnectButton.vue';

export default {
  components: { SettingsButton, TwitterConnectButton },

  data() {
    return {
      isDisconnecting: false,
    };
  },

  computed: mapState({
    twitterName: (state) => state.currentUser.twitterName,
  }),

  methods: {
    async handleDisconnect() {
      this.isDisconnecting = true;

      try {
        await this.$axios({
          baseURL: null,
          url: '/api/twitter-connect',
          method: 'DELETE',
        });
      } catch (err) {
        this.$store.commit('showErrorModal');
        throw err;
      }

      this.$store.commit('disconnectedTwitter');
      this.isDisconnecting = false;
    },
  },
};
</script>

<style lang="scss" scoped>
.button-row {
  text-align: center;
}
</style>