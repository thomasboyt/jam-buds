<template>
  <div>
    <div class="connect-page">
      <template v-if="serviceName">
        <h3>you've connected {{ serviceName }}!</h3>
      </template>
      <template v-else>
        <h3>connect a streaming service <small>(optional!)</small></h3>

        <p>
          the best way to listen on jam buds is to use a spotify or apple music
          account, if you have one.
        </p>

        <div class="button-group">
          <spotify-connect-button
            redirect="/welcome/connect"
            @connected="handleConnected"
          />
          <apple-music-connect-button @connected="handleConnected" />
        </div>
      </template>

      <div class="lower">
        <template v-if="serviceName">
          <jb-button tag="nuxt-link" :to="nextPage">continue</jb-button>
        </template>
        <template v-else>
          <p>
            <nuxt-link :to="nextPage"> continue without connecting </nuxt-link>
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
import SpotifyConnectButton from '~/components/settings/SpotifyConnectButton.vue';
import AppleMusicConnectButton from '~/components/settings/AppleMusicConnectButton.vue';
import JbButton from '~/components/lib/JbButton.vue';

export default {
  components: { SpotifyConnectButton, AppleMusicConnectButton, JbButton },

  data() {
    return {
      nextPage: '/welcome/connect-twitter',
    };
  },

  computed: {
    serviceName() {
      return this.$store.getters.streamingServiceName;
    },
  },

  methods: {
    handleConnected() {
      this.$router.push(this.nextPage);
    },
  },
};
</script>

<style lang="scss" scoped>
@import '~/assets/styles/mixins.scss';

.connect-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 $spacing-sm;
  text-align: center;
}

a {
  color: black;
}

h3 {
  font-size: $text-lg;
  line-height: $leading-none;
  margin-bottom: $spacing-lg;
  font-weight: normal;
}

.lower {
  margin-top: $spacing-2xl;
}

.button-group {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;

  ::v-deep .jb-button {
    flex: 0 0 auto;
    margin: 10px;
  }
}
</style>
