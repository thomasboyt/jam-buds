<template>
  <div :class="['app-container', { 'webview-container': isWebView }]">
    <div class="page-container">
      <nuxt />
    </div>

    <audio-player />
    <apple-music-loader />
    <spotify-loader />
    <flash-message />
    <template v-if="authenticated">
      <notifications-modal />
    </template>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import AppleMusicLoader from '~/components/AppleMusicLoader.vue';
import SpotifyLoader from '~/components/SpotifyLoader.vue';
import AudioPlayer from '~/components/audio-player/AudioPlayer.vue';
import FlashMessage from '~/components/FlashMessage.vue';
import NotificationsModal from '~/components/NotificationsModal.vue';

export default {
  components: {
    AudioPlayer,
    AppleMusicLoader,
    SpotifyLoader,
    FlashMessage,
    NotificationsModal,
  },

  head() {
    return {
      titleTemplate: (title) => (title ? `${title} | Jam Buds` : 'Jam Buds'),
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },

        { name: 'twitter:card', content: 'summary' },
        { hid: 'title', name: 'og:title', content: 'jam buds!' },
        {
          hid: 'description',
          name: 'og:description',
          content: 'a place for sharing music with your friends!',
        },

        {
          name: 'og:image',
          content: `${this.$config.STATIC_URL}/corgi_icon_square.png`,
        },
      ],

      link: [
        {
          rel: 'icon',
          type: 'image/png',
          href: `${this.$config.STATIC_URL}/favicon16.png`,
          sizes: '16x16',
        },
        {
          rel: 'icon',
          type: 'image/png',
          href: `${this.$config.STATIC_URL}/favicon32.png`,
          sizes: '32x32',
        },
      ],
    };
  },

  computed: mapState({
    authenticated: (state) => state.auth.authenticated,
    isWebView: (state) => state.isWebView,
  }),
};
</script>
