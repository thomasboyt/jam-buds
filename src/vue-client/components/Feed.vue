<template>
  <div class="playlist">
    <h2>your feed</h2>

    <playlist
      :entries="feedEntries"
      :entriesExhausted="feedEntriesExhausted"
      :loadingNextPage="loadingNextPage"
      playbackSourceName="your feed"
      playbackSourcePath="/"
      @requestNextPage="handleRequestNextPage">
      <p slot="placeholder">
        Your feed doesn't have any entries yet! <router-link to="/find-friends">Find some friends to follow!</router-link>
      </p>
    </playlist>
  </div>
</template>

<script>
  import {mapGetters, mapState} from 'vuex';
  import Playlist from './playlist/Playlist.vue';

  export default {
    components: {Playlist},

    computed: {
      ...mapGetters(['feedEntries']),
      ...mapState({
        feedEntriesExhausted: (state) => state.feed.entriesExhausted,
      }),
    },

    data() {
      return {
        loadingNextPage: false,
      };
    },

    methods: {
      async handleRequestNextPage() {
        this.loadingNextPage = true;

        try {
          await this.$store.dispatch('loadFeedPage');
        } catch(err) {
          console.log('request error');
          console.log(err);
        } finally {
          this.loadingNextPage = false;
        }
      }
    }
  }
</script>