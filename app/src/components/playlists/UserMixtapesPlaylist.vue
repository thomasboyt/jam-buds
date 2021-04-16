<template>
  <playlist
    :playlist-key="playlistKey"
    :loading-next-page="loadingNextPage"
    :error="initialFetchState.error"
    :is-loading="initialFetchState.pending"
    @requestNextPage="handleRequestNextPage"
  >
    <template #item="{ item }">
      <mixtape-item
        :mixtape-id="item.mixtapeId"
        :like-source-params="{
          likeSource: 'post',
          sourceUserNames: [userName],
        }"
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
      <p>This user does not have any mixtapes yet :(</p>
    </template>
  </playlist>
</template>

<script>
import Playlist from '~/components/playlist/Playlist.vue';
import MixtapeItem from '~/components/playlist/MixtapeItem.vue';
import EntryDetails from '~/components/playlist/EntryDetails.vue';

export default {
  components: {
    Playlist,
    MixtapeItem,
    EntryDetails,
  },

  props: ['userName', 'initialFetchState'],

  data() {
    return {
      loadingNextPage: false,
    };
  },

  computed: {
    playlistKey() {
      return `${this.userName}/mixtapes`;
    },
  },

  methods: {
    async handleRequestNextPage() {
      this.loadingNextPage = true;

      try {
        await this.$store.dispatch('playlist/loadNextPlaylistPage', {
          key: this.playlistKey,
        });
      } catch (err) {
        this.$accessor.showErrorModal();
        throw err;
      } finally {
        this.loadingNextPage = false;
      }
    },
  },
};
</script>
