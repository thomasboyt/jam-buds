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
    <apple-music-loader v-if="authenticated" />
    <flash-message />
  </div>
</template>

<script>
import { mapState } from 'vuex';
import AppleMusicLoader from '~/components/AppleMusicLoader.vue';
import AudioPlayer from '~/components/audio-player/AudioPlayer.vue';
import AddSongModal from '~/components/new-song-modal/AddSongModal.vue';
import MobileNav from '~/components/MobileNav.vue';
import FlashMessage from '~/components/FlashMessage.vue';

export default {
  components: {
    AudioPlayer,
    AddSongModal,
    AppleMusicLoader,
    MobileNav,
    FlashMessage,
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
