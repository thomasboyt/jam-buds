<template>
  <div class="app-container">
    <mobile-nav />

    <div class="page-container">
      <slot />
    </div>

    <add-song-modal
      v-if="authenticated"
      title="share a jam!"
      :is-open="addSongModalIsOpen"
      @close="handleCloseAddSongModal"
    />

    <audio-player />
    <apple-music-loader v-if="authenticated" />
  </div>
</template>

<script>
import { mapState } from 'vuex';
import AppleMusicLoader from '~/components/AppleMusicLoader.vue';
import AudioPlayer from '~/components/audio-player/AudioPlayer.vue';
import AddSongModal from '~/components/new-song-modal/AddSongModal.vue';
import MobileNav from '~/components/MobileNav.vue';

export default {
  components: {
    AudioPlayer,
    AddSongModal,
    AppleMusicLoader,
    MobileNav,
  },

  metaInfo: {
    titleTemplate: (title) => (title ? `${title} | Jam Buds` : 'Jam Buds'),
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
