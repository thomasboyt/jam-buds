<template>
  <div class="playlist">
    <div class="header-row">
      <page-header title="your feed" />
      <div class="header-row-button-container">
        <add-song-button @click="handleAddSong">+ post a song!</add-song-button>
      </div>
    </div>

    <notifications-feed-section />

    <playlist
      :items="items"
      :items-exhausted="feedItemsExhausted"
      :loading-next-page="loadingNextPage"
      @requestNextPage="handleRequestNextPage"
    >
      <template v-slot:item="{ item }">
        <post-item
          :item="item"
          @requestPlay="handleRequestPlay"
          verb="posted"
        />
      </template>

      <template #placeholder>
        <p>
          Your feed doesn't have any items yet!
          <nuxt-link to="/find-friends">
            Find some friends to follow!
          </nuxt-link>
        </p>
      </template>
    </playlist>
  </div>
</template>

<script>
import { mapState } from 'vuex';

import Playlist from './playlist/Playlist.vue';
import AddSongButton from './AddSongButton.vue';
import PostItem from './playlist/PostItem.vue';
import PageHeader from './PageHeader.vue';
import NotificationsFeedSection from './NotificationsFeedSection.vue';

export default {
  components: {
    Playlist,
    AddSongButton,
    PostItem,
    PageHeader,
    NotificationsFeedSection,
  },

  head() {
    return {
      title: 'Feed',
    };
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

    handleAddSong() {
      this.$store.dispatch('showAddSong');
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

<style lang="scss" scoped>
.header-row {
  display: flex;
  margin-bottom: 30px;
  h2 {
    margin-bottom: 0px;
  }
}
.header-row-button-container {
  margin-left: auto;
  display: flex;
}
</style>
