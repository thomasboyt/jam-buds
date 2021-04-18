<template>
  <playlist
    :playlist-key="playlistKey"
    :loading-next-page="loadingNextPage"
    :error="$fetchState.error"
    :is-loading="$fetchState.pending"
    @requestNextPage="handleRequestNextPage"
  >
    <template #item="{ item }">
      <playlist-entry
        :item="item"
        :user-name="userName"
        :like-source-params="{
          likeSource: 'post',
          sourceUserNames: [userName],
        }"
        @requestPlay="handleRequestPlay"
      />
      <entry-details
        type="userPlaylist"
        :id="item.postId"
        :name="userName"
        :note="item.noteText"
        :date="item.timestamp"
      />
    </template>

    <template #placeholder>
      <p>This user has not posted any songs yet :(</p>
    </template>
  </playlist>
</template>

<script>
import Playlist from '~/components/playlist/Playlist.vue';
import PlaylistEntry from '~/components/playlist/PlaylistEntry.vue';
import EntryDetails from '~/components/playlist/EntryDetails.vue';

export default {
  components: {
    Playlist,
    PlaylistEntry,
    EntryDetails,
  },

  props: ['userName'],

  fetch() {
    return this.$accessor.playlist.loadProfilePostsPlaylist(this.userName);
  },

  data() {
    return {
      loadingNextPage: false,
    };
  },

  computed: {
    playlistKey() {
      return `${this.userName}/posts`;
    },
    playbackSourcePath() {
      return `/users/${this.userName}`;
    },
    title() {
      return `${this.userName}'s playlist`;
    },
  },

  methods: {
    async handleRequestNextPage() {
      this.loadingNextPage = true;

      try {
        await this.$accessor.playlist.loadNextPlaylistPage({
          key: this.playlistKey,
        });
      } catch (err) {
        this.$accessor.showErrorModal();
        throw err;
      } finally {
        this.loadingNextPage = false;
      }
    },

    handleRequestPlay(songId) {
      this.$accessor.playback.playFromPlaylist({
        songId,
        playlistKey: this.playlistKey,
        playbackSourceLabel: this.title,
        playbackSourcePath: this.playbackSourcePath,
      });
    },
  },
};
</script>
