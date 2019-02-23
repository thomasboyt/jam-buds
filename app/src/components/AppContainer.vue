<template>
  <div class="app-container">
    <div class="site-header">
      <div class="header-content">
        <sidebar-toggle />

        <div class="header-logo">
          <h1>
            <router-link to="/">jam buds!</router-link>
          </h1>
        </div>

        <audio-player />
      </div>
    </div>

    <div class="page-container">
      <slot />
    </div>

    <add-song-modal v-if="authenticated" />

    <apple-music-loader v-if="authenticated" />
  </div>
</template>

<script>
import { mapState } from 'vuex';
import SidebarToggle from './SidebarToggle.vue';
import AppleMusicLoader from './AppleMusicLoader.vue';
import AudioPlayer from './audio-player/AudioPlayer.vue';
import AddSongModal from './new-song-modal/AddSongModal.vue';

export default {
  components: { SidebarToggle, AudioPlayer, AddSongModal, AppleMusicLoader },

  computed: mapState({
    authenticated: (state) => state.auth.authenticated,
  }),
};
</script>
