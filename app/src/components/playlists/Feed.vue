<template>
  <playlist
    playlist-key="feed"
    :loading-next-page="loadingNextPage"
    :is-loading="$fetchState.pending"
    :error="$fetchState.error"
    @requestNextPage="handleRequestNextPage"
  >
    <template v-slot:item="{ item }">
      <div data-test="feed-entry-group">
        <playlist-entry :item="item" @requestPlay="handleRequestPlay" />
        <entry-details
          v-for="post in sortPosts(item.posts)"
          type="feed"
          :id="post.id"
          :name="post.userName"
          :note="post.noteText"
          :date="post.timestamp"
          :key="post.id"
        />
      </div>
    </template>

    <template #placeholder>
      <p>
        Your feed doesn't have any items yet!
        <nuxt-link to="/public-feed">Find some buds to follow!</nuxt-link>
      </p>
    </template>
  </playlist>
</template>

<script>
import { mapState } from 'vuex';
import sortBy from 'lodash/sortBy';

import Playlist from '~/components/playlist/Playlist.vue';
import PlaylistEntry from '~/components/playlist/PlaylistEntry.vue';
import EntryDetails from '~/components/playlist/EntryDetails.vue';

export default {
  components: {
    Playlist,
    PlaylistEntry,
    EntryDetails,
  },

  async fetch() {
    return this.$store.dispatch('loadPlaylist', { key: 'feed', url: '/feed' });
  },

  data() {
    return {
      loadingNextPage: false,
    };
  },

  computed: {
    items() {
      return this.$store.getters.playlistItems('feed');
    },
    ...mapState({
      feedItemsExhausted: (state) => state.playlists.feed.itemsExhausted,
    }),
  },

  methods: {
    sortPosts(posts) {
      return sortBy(posts, (item) => -new Date(item.timestamp).valueOf());
    },

    async handleRequestNextPage() {
      this.loadingNextPage = true;

      try {
        await this.$store.dispatch('loadNextPlaylistPage', { key: 'feed' });
      } catch (err) {
        this.$store.commit('showErrorModal');
        throw err;
      } finally {
        this.loadingNextPage = false;
      }
    },

    handleRequestPlay(songId) {
      this.$store.dispatch('playback/playFromPlaylist', {
        songId,
        playlistKey: 'feed',
        playbackSourceLabel: 'your feed',
        playbackSourcePath: '/',
      });
    },
  },
};
</script>
