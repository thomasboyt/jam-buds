<template>
  <div class="app-container">
    <mobile-nav />

    <div class="page-container">
      <slot />
    </div>

    <add-song-modal v-if="authenticated" />

    <audio-player />
    <apple-music-loader v-if="authenticated" />
  </div>
</template>

<script>
import { mapState } from 'vuex';
import AppleMusicLoader from './AppleMusicLoader.vue';
import AudioPlayer from './audio-player/AudioPlayer.vue';
import AddSongModal from './new-song-modal/AddSongModal.vue';
import MobileNav from './MobileNav.vue';

export default {
  components: {
    AudioPlayer,
    AddSongModal,
    AppleMusicLoader,
    MobileNav,
  },

  metaInfo: {
    titleTemplate: (title) => (title ? `${title} | Jam Buds` : 'Jam Buds'),
    meta: [
      { name: 'twitter:card', content: 'summary' },
      { vmid: 'title', name: 'og:title', content: 'jam buds!' },
      {
        vmid: 'description',
        name: 'og:description',
        content: 'share some music, I dunno!!',
      },
      {
        name: 'og:image',
        content: `${process.env.STATIC_URL}/corgi_icon_square.png`,
      },
    ],
  },

  computed: mapState({
    authenticated: (state) => state.auth.authenticated,
  }),
};
</script>
