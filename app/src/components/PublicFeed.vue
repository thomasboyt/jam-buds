<template>
  <div class="playlist">
    <h2>public feed</h2>
    <p>
      this page will probably be replaced by some kind of fancy "top posts"
      aggregator once we have, like, actual users. for now, please use it to
      find folks you'd like to follow, or just see what people are into outside
      of your sphere.
    </p>

    <p v-if="authenticated">
      you have public posts
      <strong>{{ publicPostsStatus }}</strong> and will
      <span v-if="!enabledPublicPosts">not</span> show up in this feed. you can
      change that <router-link to="/settings/profile">here</router-link> if
      you'd like.
    </p>

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
      authenticated: (state) => state.auth.authenticated,
      enabledPublicPosts: (state) => state.currentUser.showInPublicFeed,
      feedEntriesExhausted: (state) =>
        state.playlists.publicFeed.entriesExhausted,
    }),

    publicPostsStatus() {
      return this.enabledPublicPosts ? 'enabled' : 'disabled';
    },
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