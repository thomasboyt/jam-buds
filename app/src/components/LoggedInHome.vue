<template>
  <div>
    <page-header title="your feed">
      <template #cta>
        <add-song-button @click="handleAddSongClick">
          + post ur jam
        </add-song-button>
      </template>
    </page-header>

    <feed />

    <new-jam-modal title="share a jam!" />
  </div>
</template>

<script>
import Feed from '~/components/playlists/Feed.vue';
import AddSongButton from './AddSongButton.vue';
import NewJamModal from './new-jam-modal/NewJamModal.vue';
import PageHeader from './PageHeader.vue';
import { showModal } from '~/util/modal';

export default {
  components: { Feed, NewJamModal, PageHeader, AddSongButton },

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
