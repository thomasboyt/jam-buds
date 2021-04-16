<template>
  <playlist
    playlist-key="publicFeed"
    :loading-next-page="loadingNextPage"
    :is-loading="$fetchState.pending"
    :error="$fetchState.error"
    @requestNextPage="handleRequestNextPage"
  >
    <template #item="{ item }">
      <playlist-entry
        :item="item"
        :like-source-params="{
          likeSource: 'post',
          sourceUserNames: item.posts.map((post) => post.userName),
        }"
        @requestPlay="handleRequestPlay"
      />
      <entry-details
        v-for="post in item.posts"
        type="feed"
        :id="post.id"
        :name="post.userName"
        :note="post.noteText"
        :date="post.timestamp"
        :key="post.id"
      />
    </template>

    <template #placeholder>
      <p>This feed is empty :(</p>
    </template>
  </playlist>
</template>

<script>
import sortBy from 'lodash/sortBy';

import Playlist from '~/components/playlist/Playlist.vue';
import PlaylistEntry from '~/components/playlist/PlaylistEntry.vue';
import EntryDetails from '~/components/playlist/EntryDetails.vue';

export default {
  components: { Playlist, PlaylistEntry, EntryDetails },

  async fetch() {
    await this.$store.dispatch('playlist/loadPlaylist', {
      key: 'publicFeed',
      url: '/public-feed',
    });
  },

  data() {
    return {
      loadingNextPage: false,
    };
  },

  methods: {
    sortPosts(posts) {
      return sortBy(posts, (item) => -new Date(item.timestamp).valueOf());
    },

    async handleRequestNextPage() {
      this.loadingNextPage = true;

      try {
        await this.$store.dispatch('playlist/loadNextPlaylistPage', {
          key: 'publicFeed',
        });
      } catch (err) {
        this.$accessor.showErrorModal();
        throw err;
      } finally {
        this.loadingNextPage = false;
      }
    },

    handleRequestPlay(songId) {
      this.$store.dispatch('playback/playFromPlaylist', {
        songId,
        playlistKey: 'publicFeed',
        playbackSourceLabel: 'public feed',
        playbackSourcePath: '/public-feed',
      });
    },
  },
};
</script>
