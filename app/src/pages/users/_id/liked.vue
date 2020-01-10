<template>
  <div>
    <profile-nav :title="title" />
    <playlist
      :items="items"
      :items-exhausted="itemsExhausted"
      :loading-next-page="loadingNextPage"
      @requestNextPage="handleRequestNextPage"
    >
      <template v-slot:item="{ item }">
        <post-item :item="item" @requestPlay="handleRequestPlay" verb="liked" />
      </template>

      <template v-slot:placeholder>
        <p>
          This user has not liked any songs yet :(
        </p>
      </template>
    </playlist>
  </div>
</template>

<script>
import ProfileNav from '../../../components/ProfileNav.vue';
import Playlist from '../../../components/playlist/Playlist.vue';
import PostItem from '../../../components/playlist/PostItem.vue';

export default {
  components: {
    ProfileNav,
    Playlist,
    PostItem,
  },

  head() {
    return {
      title: this.title,
    };
  },

  async fetch({ store, route }) {
    await store.dispatch('loadProfileLikesPlaylist', route.params.id);
  },

  data() {
    return {
      loadingNextPage: false,
    };
  },

  computed: {
    name() {
      return this.$route.params.id;
    },
    playlistKey() {
      return `${this.name}/likes`;
    },
    items() {
      return this.$store.getters.playlistItems(this.playlistKey);
    },
    itemsExhausted() {
      return this.$store.state.playlists[this.playlistKey].itemsExhausted;
    },
    playbackSourcePath() {
      return `/users/${this.name}/liked`;
    },
    title() {
      return `${this.name}'s liked tracks`;
    },
  },

  methods: {
    async handleRequestNextPage() {
      this.loadingNextPage = true;

      try {
        await this.$store.dispatch('loadNextPlaylistPage', {
          key: this.playlistKey,
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
        playlistKey: this.playlistKey,
        playbackSourceLabel: this.title,
        playbackSourcePath: this.playbackSourcePath,
      });
    },
  },
};
</script>
