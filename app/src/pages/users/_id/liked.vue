<template>
  <div>
    <profile-nav :title="title" />
    <playlist
      :playlist-key="playlistKey"
      :loading-next-page="loadingNextPage"
      :error="$fetchState.error"
      :is-loading="$fetchState.pending"
      @requestNextPage="handleRequestNextPage"
    >
      <template v-slot:item="{ item }">
        <playlist-entry :item="item" @requestPlay="handleRequestPlay" />
        <entry-details
          type="userLiked"
          :name="name"
          :note="item.noteText"
          :date="item.timestamp"
        />
      </template>

      <template v-slot:placeholder>
        <p>This user has not liked any songs yet :(</p>
      </template>
    </playlist>
  </div>
</template>

<script>
import ProfileNav from '../../../components/ProfileNav.vue';
import Playlist from '../../../components/playlist/Playlist.vue';
import PlaylistEntry from '../../../components/playlist/PlaylistEntry.vue';
import EntryDetails from '../../../components/playlist/EntryDetails.vue';

export default {
  components: {
    ProfileNav,
    Playlist,
    PlaylistEntry,
    EntryDetails,
  },

  head() {
    return {
      title: this.title,
    };
  },

  fetch() {
    return this.$store.dispatch(
      'loadProfileLikesPlaylist',
      this.$route.params.id
    );
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
