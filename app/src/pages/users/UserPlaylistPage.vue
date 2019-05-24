<template>
  <div>
    <profile-nav :title="title" />
    <playlist
      entry-type="playlist-entry"
      :entries="entries"
      :entries-exhausted="entriesExhausted"
      :loading-next-page="loadingNextPage"
      :playback-source-label="title"
      :playback-source-path="playbackSourcePath"
      @requestNextPage="handleRequestNextPage"
    >
      <p slot="placeholder">
        This user has not posted any songs yet :(
      </p>
    </playlist>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import ProfileNav from '../../components/ProfileNav.vue';
import Playlist from '../../components/playlist/Playlist.vue';
import titleMixin from '../../util/titleMixin';

export default {
  components: {
    ProfileNav,
    Playlist,
  },

  mixins: [titleMixin],

  title() {
    return this.title;
  },

  async asyncData({ store, route }) {
    await store.dispatch('loadProfilePostsPlaylist', route.params.id);
  },

  data() {
    return {
      loadingNextPage: false,
    };
  },

  computed: {
    entries() {
      return this.$store.getters.playlistEntries('profilePosts');
    },
    ...mapState({
      name: (state) => state.profile.user.name,
      entriesExhausted: (state) =>
        state.playlists.profilePosts.entriesExhausted,
    }),
    playbackSourcePath() {
      return `/users/${this.name}`;
    },
    title() {
      return `${this.name}'s playlist`;
    },
  },

  methods: {
    async handleRequestNextPage() {
      this.loadingNextPage = true;

      try {
        await this.$store.dispatch('loadPlaylistPage', { key: 'profilePosts' });
      } catch (err) {
        console.log('request error');
        console.log(err);
      } finally {
        this.loadingNextPage = false;
      }
    },
  },
};
</script>
