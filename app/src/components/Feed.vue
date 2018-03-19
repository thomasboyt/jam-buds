<template>
  <div class="playlist">
    <h2>your feed</h2>

    <playlist
      :entries="entries"
      :entriesExhausted="feedEntriesExhausted"
      :loadingNextPage="loadingNextPage"
      playbackSourceLabel="your feed"
      playbackSourcePath="/"
      @requestNextPage="handleRequestNextPage">
      <p slot="placeholder">
        Your feed doesn't have any entries yet! <router-link to="/find-friends">Find some friends to follow!</router-link>
      </p>
    </playlist>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex';
import Playlist from './playlist/Playlist.vue';

export default {
  components: { Playlist },

  computed: {
    entries() {
      return this.$store.getters.playlistEntries('feed');
    },
    ...mapState({
      feedEntriesExhausted: (state) => state.playlists.feed.entriesExhausted,
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
        await this.$store.dispatch('loadPlaylistPage', { key: 'feed' });
      } catch (err) {
        console.log('request error');
        console.log(err);
      } finally {
        this.loadingNextPage = false;
      }
    },
  },
};
</script>
