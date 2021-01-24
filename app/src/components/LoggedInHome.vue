<template>
  <div>
    <page-header title="your feed">
      <template #cta>
        <add-song-button @click="handleAddSongClick">
          + post a song
        </add-song-button>
      </template>
    </page-header>

    <feed />

    <add-song-modal title="share a jam!" />
  </div>
</template>

<script>
import Feed from '~/components/playlists/Feed.vue';
import AddSongButton from './AddSongButton.vue';
import AddSongModal from './new-song-modal/AddSongModal.vue';
import PageHeader from './PageHeader.vue';
import { showModal } from '~/util/modal';

export default {
  components: { Feed, AddSongModal, PageHeader, AddSongButton },

  head() {
    return {
      title: 'Feed',
    };
  },

  methods: {
    handleAddSongClick() {
      showModal(this.$router, this.$route, 'add-song');
    },
  },
};
</script>
