<template>
  <div class="app-container">
    <mobile-nav />

    <div class="page-container">
      <nuxt />
    </div>

    <add-song-modal
      v-if="authenticated"
      title="share a jam!"
      :is-open="addSongModalIsOpen"
      @close="handleCloseAddSongModal"
    />

    <audio-player />
    <apple-music-loader />
    <spotify-loader />
    <flash-message />
  </div>
</template>

<script>
import { mapState } from 'vuex';
import AppleMusicLoader from '~/components/AppleMusicLoader.vue';
import SpotifyLoader from '~/components/SpotifyLoader.vue';
import AudioPlayer from '~/components/audio-player/AudioPlayer.vue';
import AddSongModal from '~/components/new-song-modal/AddSongModal.vue';
import MobileNav from '~/components/MobileNav.vue';
import FlashMessage from '~/components/FlashMessage.vue';

export default {
  components: {
    AudioPlayer,
    AddSongModal,
    AppleMusicLoader,
    SpotifyLoader,
    MobileNav,
    FlashMessage,
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
    addSongModalIsOpen: (state) => state.addSong.showModal,
  }),

  methods: {
    handleCloseAddSongModal() {
      this.$store.dispatch('closeAddSong');
    },
  },
};
</script>
