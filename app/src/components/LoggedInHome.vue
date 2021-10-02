<template>
  <div>
    <page-header title="your feed">
      <template #cta>
        <post-jam-button @click="handlePostJamClick">
          + post ur jam
        </post-jam-button>
      </template>
    </page-header>

    <feed />

    <new-jam-modal title="share a jam!" />
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Feed from '~/components/playlists/Feed.vue';
import PostJamButton from './PostJamButton.vue';
import NewJamModal from './new-jam-modal/NewJamModal.vue';
import PageHeader from './PageHeader.vue';
import { showModal } from '~/util/modal';

export default Vue.extend({
  components: { Feed, NewJamModal, PageHeader, PostJamButton },

  head() {
    return {
      title: 'Feed',
    };
  },

  methods: {
    handlePostJamClick() {
      showModal(this.$router, this.$route, 'new-jam');
    },
  },
});
</script>
