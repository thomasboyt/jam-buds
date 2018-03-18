<template>
  <div class="app-container">
    <div class="site-header">
      <div class="header-content">
        <sidebar-toggle></sidebar-toggle>

        <div class="header-logo">
          <h1>
            <router-link to="/">jam buds!</router-link>
          </h1>
        </div>

        <audio-player></audio-player>
      </div>
    </div>

    <div class="page-container">
      <slot></slot>
    </div>

    <div v-if="authenticated">
      <!-- TODO: Render <add-song-modal /> here if logged in! -->
    </div>
  </div>
</template>

<script>
  import {mapState} from 'vuex';
  import SidebarToggle from './SidebarToggle.vue';
  import AudioPlayer from './audio-player/AudioPlayer.vue';

  export default {
    computed: mapState(['authenticated']),

    components: {SidebarToggle, AudioPlayer},
  }
</script>