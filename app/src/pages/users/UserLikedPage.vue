<template>
  <div>
    <profile-nav :title="title" />
    <playlist
      entry-type="like-entry"
      :entries="entries"
      :entries-exhausted="entriesExhausted"
      :loading-next-page="loadingNextPage"
      :playback-source-label="title"
      :playback-source-path="playbackSourcePath"
      @requestNextPage="handleRequestNextPage"
    >
      <p slot="placeholder">
        This user has not liked any songs yet :(
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

  title() {
    return this.title;
  },

  mixins: [titleMixin],

  async asyncData({ store, route }) {
    await store.dispatch('loadProfileLikesPlaylist', route.params.id);
  },

  data() {
    return {
      loadingNextPage: false,
    };
  },

  computed: {
    entries() {
      return this.$store.getters.playlistEntries('profileLikes');
    },
    ...mapState({
      name: (state) => state.profile.user.name,
      entriesExhausted: (state) =>
        state.playlists.profileLikes.entriesExhausted,
    }),
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
        await this.$store.dispatch('loadPlaylistPage', { key: 'profileLikes' });
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
