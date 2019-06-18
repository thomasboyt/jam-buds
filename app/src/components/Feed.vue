<template>
  <div class="playlist">
    <div class="header-row">
      <h2>your feed</h2>
      <div class="header-row-button-container">
        <create-mixtape-button>new mixtape</create-mixtape-button>
        <add-song-button @click="handleAddSong">+ post a song!</add-song-button>
      </div>
    </div>

    <playlist
      :items="items"
      :items-exhausted="feedItemsExhausted"
      :loading-next-page="loadingNextPage"
      @requestNextPage="handleRequestNextPage"
    >
      <template v-slot:item="{ item }">
        <feed-item
          :item="item"
          playback-source-label="your feed"
          playback-source-path="/"
        />
      </template>

      <template #placeholder>
        <p>
          Your feed doesn't have any items yet!
          <router-link to="/find-friends">
            Find some friends to follow!
          </router-link>
        </p>
      </template>
    </playlist>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import Playlist from './playlist/Playlist.vue';
import AddSongButton from './AddSongButton.vue';
import CreateMixtapeButton from './CreateMixtapeButton.vue';
import FeedItem from './playlist/FeedItem.vue';

export default {
  components: { Playlist, AddSongButton, FeedItem, CreateMixtapeButton },

  metaInfo: {
    title: 'Feed',
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
        await this.$store.dispatch('loadPlaylistPage', { key: 'feed' });
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
