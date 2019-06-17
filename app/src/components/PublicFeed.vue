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
      :items="items"
      :items-exhausted="feedItemsExhausted"
      :loading-next-page="loadingNextPage"
      @requestNextPage="handleRequestNextPage"
    >
      <template v-slot:item="{ item }">
        <feed-item
          :item="item"
          playback-source-label="public feed"
          playback-source-path="/public-feed"
        />
      </template>

      <template v-slot:placeholder>
        <p>
          This feed is empty :(
        </p>
      </template>
    </playlist>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import Playlist from './playlist/Playlist.vue';
import FeedItem from './playlist/FeedItem.vue';

export default {
  components: { Playlist, FeedItem },

  metaInfo: {
    title: 'Public Feed',
  },

  data() {
    return {
      loadingNextPage: false,
    };
  },

  computed: {
    items() {
      return this.$store.getters.playlistItems('publicFeed');
    },
    ...mapState({
      authenticated: (state) => state.auth.authenticated,
      enabledPublicPosts: (state) => state.currentUser.showInPublicFeed,
      feedItemsExhausted: (state) => state.playlists.publicFeed.itemsExhausted,
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
