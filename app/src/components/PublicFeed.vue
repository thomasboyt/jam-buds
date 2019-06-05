<template>
  <div class="playlist">
    <h2>public feed</h2>

    <playlist
      entry-type="feed-entry"
      :entries="entries"
      :entries-exhausted="feedEntriesExhausted"
      :loading-next-page="loadingNextPage"
      playback-source-label="public feed"
      playback-source-path="/public-feed"
      @requestNextPage="handleRequestNextPage"
    >
      <p slot="placeholder">
        This feed is empty :(
      </p>
    </playlist>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import Playlist from './playlist/Playlist.vue';

export default {
  components: { Playlist },

  metaInfo: {
    title: 'Public Feed',
  },

  data() {
    return {
      loadingNextPage: false,
    };
  },

  computed: {
    entries() {
      return this.$store.getters.playlistEntries('publicFeed');
    },
    ...mapState({
      feedEntriesExhausted: (state) =>
        state.playlists.publicFeed.entriesExhausted,
    }),
  },

  methods: {
    async handleRequestNextPage() {
      this.loadingNextPage = true;

      try {
        await this.$store.dispatch('loadPlaylistPage', { key: 'publicFeed' });
      } catch (err) {
        this.$store.commit('showErrorModal');
        throw err;
      } finally {
        this.loadingNextPage = false;
      }
    },
  },
};
</script>