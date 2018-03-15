<template>
  <div class="app-container">
    <div class="site-header">
      <div class="header-content">
        <!-- TODO: Render <sidebar-toggle /> here -->

        <div class="header-logo">
          <h1>
            <router-link to="/">jam buds!</router-link>
          </h1>
        </div>

        <!-- TODO: Render <audio-player /> here -->
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

  export default {
    computed: mapState(['authenticated']),
  }
</script>