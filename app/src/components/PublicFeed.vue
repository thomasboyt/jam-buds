<template>
  <div class="playlist">
    <page-header title="public feed" />
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
      change that <nuxt-link to="/settings">here</nuxt-link> if you'd like.
    </p>

    <playlist
      playlist-key="publicFeed"
      :loading-next-page="loadingNextPage"
      :is-loading="$fetchState.pending"
      :error="$fetchState.error"
      @requestNextPage="handleRequestNextPage"
    >
      <template v-slot:item="{ item }">
        <playlist-entry :item="item" @requestPlay="handleRequestPlay" />
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

      <template v-slot:placeholder>
        <p>This feed is empty :(</p>
      </template>
    </playlist>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import sortBy from 'lodash/sortBy';

import Playlist from './playlist/Playlist.vue';
import PlaylistEntry from './playlist/PlaylistEntry.vue';
import EntryDetails from './playlist/EntryDetails.vue';
import PageHeader from './PageHeader.vue';

export default {
  components: { Playlist, PlaylistEntry, EntryDetails, PageHeader },

  head() {
    return {
      title: 'Public Feed',
    };
  },

  async fetch() {
    await this.$store.dispatch('loadPlaylist', {
      key: 'publicFeed',
      url: '/public-feed',
    });
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
    sortPosts(posts) {
      return sortBy(posts, (item) => -new Date(item.timestamp).valueOf());
    },

    async handleRequestNextPage() {
      this.loadingNextPage = true;

      try {
        await this.$store.dispatch('loadNextPlaylistPage', {
          key: 'publicFeed',
        });
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
        playlistKey: 'publicFeed',
        playbackSourceLabel: 'public feed',
        playbackSourcePath: '/public-feed',
      });
    },
  },
};
</script>
