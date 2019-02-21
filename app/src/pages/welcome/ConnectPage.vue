<template>
  <div>
    <div class="connect-page">
      <template v-if="hasSpotify || hasAppleMusic">
        <h3>
          you've connected <span v-if="hasSpotify">spotify</span
          ><span v-else>apple music</span>!
        </h3>
      </template>
      <template v-else>
        <h3>connect a streaming service</h3>

        <p>
          the best way to listen on jam buds is to use a spotify or apple music
          account, if you have one.
        </p>

        <div>
          <spotify-connect-button redirect="/welcome/connect" />
          <apple-music-connect-button
            @connectedAppleMusic="handleConnectedAppleMusic"
          />
        </div>
      </template>

      <div class="lower">
        <template v-if="hasSpotify || hasAppleMusic">
          <settings-button tag="router-link" :to="nextPage"
            >continue</settings-button
          >
        </template>
        <template v-else>
          <p>
            <router-link :to="nextPage">
              continue without connecting
            </router-link>
          </p>

          <p>
            (no streaming? no problem; just click the youtube button on a song
            to search for it)
          </p>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';

import SpotifyConnectButton from '../../components/settings/SpotifyConnectButton.vue';
import AppleMusicConnectButton from '../../components/settings/AppleMusicConnectButton.vue';
import SettingsButton from '../../components/settings/SettingsButton.vue';

export default {
  components: { SpotifyConnectButton, AppleMusicConnectButton, SettingsButton },

  data() {
    return {
      nextPage: '/',
    };
  },

  computed: mapState({
    hasSpotify: (state) => state.currentUser.hasSpotify,
    hasAppleMusic: (state) => state.currentUser.hasAppleMusic,
  }),

  methods: {
    handleConnectedAppleMusic() {
      this.$router.push(this.nextPage);
    },
  },
};
</script>

<style lang="scss" scoped>
.connect-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 10px;
  text-align: center;

  --theme-link-color: black;
}

a {
  color: black;
}

h3 {
  font-size: 32px;
  line-height: 1em;
  margin-bottom: 24px;
  font-weight: normal;
}

.lower {
  margin-top: 50px;
}
</style>
