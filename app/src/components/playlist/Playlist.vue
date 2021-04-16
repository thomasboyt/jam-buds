<template>
  <page-placeholder v-if="isLoading && !hasLoadedInitialItems">
    <!-- TODO: spinner go here? -->
  </page-placeholder>

  <page-placeholder v-else-if="!items.length">
    <slot name="placeholder" />
  </page-placeholder>

  <div v-else>
    <ul>
      <li v-for="item in items" :key="item.id">
        <slot name="item" :item="item" />
      </li>
    </ul>

    <jb-button
      v-if="!itemsExhausted"
      class="load-page-button"
      :disabled="loadingNextPage"
      @click="handleRequestNextPage"
    >
      Load next page
    </jb-button>
  </div>
</template>

<script>
import JbButton from '../lib/JbButton';
import PagePlaceholder from '../PagePlaceholder.vue';

export default {
  components: { JbButton, PagePlaceholder },

  props: ['playlistKey', 'loadingNextPage', 'isLoading'],

  computed: {
    items() {
      return this.$store.getters['playlist/getPlaylist'](this.playlistKey);
    },
    itemsExhausted() {
      return this.$accessor.playlist.playlists[this.playlistKey].itemsExhausted;
    },
    hasLoadedInitialItems() {
      return this.$accessor.playlist.playlists[this.playlistKey]
        .hasLoadedInitialItems;
    },
  },

  methods: {
    handleRequestNextPage(evt) {
      evt.preventDefault();
      this.$emit('requestNextPage');
    },
  },
};
</script>

<style lang="scss" scoped>
.load-page-button {
  width: 100%;
  padding: 20px 0;
  margin-top: 10px;
}
</style>
