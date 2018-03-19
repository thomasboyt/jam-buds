<template>
  <div>
    <profile-nav :title="title"></profile-nav>
    <playlist
      :entries="entries"
      :entriesExhausted="entriesExhausted"
      :loadingNextPage="loadingNextPage"
      :playbackSourceLabel="title"
      :playbackSourcePath="playbackSourcePath"
      @requestNextPage="handleRequestNextPage">
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

export default {
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
      name: (state) => state.profile.user.twitterName,
      title: (state) => `@${state.profile.user.twitterName}'s liked tracks`,
      entriesExhausted: (state) =>
        state.playlists.profileLikes.entriesExhausted,
    }),
    playbackSourcePath() {
      return `/users/${this.name}/liked`;
    },
  },

  methods: {
    async handleRequestNextPage() {
      this.loadingNextPage = true;

      try {
        await this.$store.dispatch('loadPlaylistPage', { key: 'profileLikes' });
      } catch (err) {
        console.log('request error');
        console.log(err);
      } finally {
        this.loadingNextPage = false;
      }
    },
  },

  components: {
    ProfileNav,
    Playlist,
  },
};
</script>
