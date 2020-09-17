<template>
  <div class="playlist">
    <div class="header-row">
      <page-header title="your feed" />
      <div class="header-row-button-container">
        <add-song-button @click="handleAddSongClick">
          + post a song
        </add-song-button>
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
import sortBy from 'lodash/sortBy';

import Playlist from './playlist/Playlist.vue';
import AddSongButton from './AddSongButton.vue';
import PlaylistEntry from './playlist/PlaylistEntry.vue';
import EntryDetails from './playlist/EntryDetails.vue';
import PageHeader from './PageHeader.vue';
import NotificationsFeedSection from './NotificationsFeedSection.vue';

export default {
  components: {
    Playlist,
    AddSongButton,
    PlaylistEntry,
    EntryDetails,
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

    handleAddSongClick() {
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
