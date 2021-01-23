<template>
  <transition
    name="connect-streaming-open"
    v-if="show"
    :duration="{ enter: 200, leave: 200 }"
  >
    <modal-overlay
      class="connect-streaming-banner-overlay"
      @click="handleClose"
    >
      <div class="connect-streaming-banner">
        <p class="title">
          hey! to listen to music, select a streaming service:
        </p>
        <p class="button-group">
          <spotify-connect-button
            :redirect="$route.path"
            @connected="handleConnected"
          />
          <apple-music-connect-button @connected="handleConnected" />
        </p>
        <p class="close-line">
          or
          <button
            type="button"
            @click="handleSelectYoutube"
            class="link-button"
          >
            just use youtube search
          </button>
        </p>
      </div>
    </modal-overlay>
  </transition>
</template>

<script>
import { enableBodyScroll, disableBodyScroll } from 'body-scroll-lock';
import SpotifyConnectButton from '~/components/settings//SpotifyConnectButton.vue';
import AppleMusicConnectButton from '~/components/settings/AppleMusicConnectButton.vue';
import ModalOverlay from '../ModalOverlay.vue';

export default {
  components: { AppleMusicConnectButton, SpotifyConnectButton, ModalOverlay },

  props: ['show'],

  watch: {
    show(isOpen) {
      if (isOpen) {
        disableBodyScroll();
      } else {
        enableBodyScroll();
      }
    },
  },

  methods: {
    handleConnected() {
      this.$emit('connected');
    },
    handleSelectYoutube() {
      this.$store.dispatch('updateSessionStreamingService', 'youtube');
      this.$emit('connected');
    },
    handleClose() {
      this.$emit('close');
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

  @media (max-width: $breakpoint-small) {
    height: $banner-mobile-height;
  }
}

.connect-streaming-banner-overlay {
  z-index: $z-streaming-banner-overlay;
}

.connect-streaming-open-enter-active,
.connect-streaming-open-leave-active {
  .connect-streaming-banner {
    transition: 0.2s bottom cubic-bezier(0, 0, 0.2, 1);
  }
}

.connect-streaming-open-enter,
.connect-streaming-open-leave-to {
  .connect-streaming-banner {
    bottom: -$banner-desktop-height;
    @media (max-width: $breakpoint-small) {
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
