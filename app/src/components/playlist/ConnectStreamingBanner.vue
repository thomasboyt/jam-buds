<template>
  <transition name="connect-streaming-open" v-if="isConnectStreamingBannerOpen">
    <div class="connect-streaming-banner">
      <p class="title">hey! to listen to music, select a streaming service:</p>
      <p class="button-group">
        <spotify-connect-button :redirect="$route.path" />
        <apple-music-connect-button />
      </p>
      <p class="close-line">
        or
        <button type="button" @click="handleClose" class="link-button">
          continue using youtube search
        </button>
      </p>
    </div>
  </transition>
</template>

<script>
import SpotifyConnectButton from '~/components/settings//SpotifyConnectButton.vue';
import AppleMusicConnectButton from '~/components/settings/AppleMusicConnectButton.vue';

export default {
  components: { AppleMusicConnectButton, SpotifyConnectButton },

  computed: {
    isConnectStreamingBannerOpen() {
      return this.$store.state.isConnectStreamingBannerOpen;
    },
  },

  methods: {
    handleClose() {
      this.$store.commit('hideConnectStreamingBanner');
    },
  },
};
</script>

<style lang="scss" scoped>
@import '~/assets/styles/mixins.scss';
@import '~/assets/styles/z-index.scss';

$banner-desktop-height: 165px;
$banner-mobile-height: 330px;

.connect-streaming-banner {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  height: $banner-desktop-height;
  z-index: $z-player-bar;

  background: $black;
  color: white;

  text-align: center;
  padding: 16px;

  &.connect-streaming-open-enter-active,
  &.connect-streaming-open-leave-active {
    transition: 0.2s bottom cubic-bezier(0, 0, 0.2, 1);
  }

  &.connect-streaming-open-enter,
  &.connect-streaming-open-leave-to {
    bottom: -$banner-desktop-height;
  }

  @media (max-width: $breakpoint-small) {
    height: $banner-mobile-height;
    &.connect-streaming-open-enter,
    &.connect-streaming-open-leave-to {
      bottom: -$banner-mobile-height;
    }
  }
}

.title {
  font-size: 18px;
  line-height: 24px;
  margin-bottom: 8px;
}

.button-group {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  margin: 0 auto;

  ::v-deep .jb-button {
    flex: 0 0 auto;
    width: 250px;
    margin: 10px;
    color: white;
    border-color: white;
    &:hover {
      background: rgba(255, 255, 255, 0.1);
    }
  }
}

.close-line {
  padding-top: 6px;
}

.link-button {
  text-decoration: underline;
  padding: 0;
  color: inherit;

  &:hover {
    text-decoration: none;
  }
  &:active {
    transform: none;
  }
}
</style>
