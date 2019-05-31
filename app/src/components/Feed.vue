<template>
  <div class="playlist">
    <div class="header-row">
      <h2>your feed</h2>
      <div class="header-row-button-container">
        <add-song-button />
      </div>
    </div>

    <playlist
      entry-type="feed-entry"
      :entries="entries"
      :entries-exhausted="feedEntriesExhausted"
      :loading-next-page="loadingNextPage"
      playback-source-label="your feed"
      playback-source-path="/"
      @requestNextPage="handleRequestNextPage"
    >
      <p slot="placeholder">
        Your feed doesn't have any entries yet!
        <router-link to="/find-friends">
          Find some friends to follow!
        </router-link>
      </p>
    </playlist>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import Playlist from './playlist/Playlist.vue';
import titleMixin from '../util/titleMixin';
import AddSongButton from './AddSongButton.vue';

export default {
  components: { Playlist, AddSongButton },

  mixins: [titleMixin],

  title: 'Feed',

  data() {
    return {
      loadingNextPage: false,
    };
  },

  computed: {
    entries() {
      return this.$store.getters.playlistEntries('feed');
    },
    ...mapState({
      feedEntriesExhausted: (state) => state.playlists.feed.entriesExhausted,
    }),
  },

  methods: {
    async handleRequestNextPage() {
      this.loadingNextPage = true;

      try {
        await this.$store.dispatch('loadPlaylistPage', { key: 'feed' });
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

<style lang="scss" scoped>
.header-row {
  display: flex;
}
.header-row-button-container {
  margin-left: auto;
}
</style>