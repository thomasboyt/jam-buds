<template>
  <div v-if="isLoading && !hasLoadedInitialItems" class="main-placeholder">
    <!-- TODO: spinner go here? -->
  </div>

  <div v-else-if="!items.length" class="main-placeholder">
    <slot name="placeholder" />
  </div>

  <div v-else>
    <ul class="playlist-entries">
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

    <connect-streaming-banner />
  </div>
</template>

<script>
import { mapState } from 'vuex';
import ConnectStreamingBanner from './ConnectStreamingBanner.vue';
import JbButton from '../lib/JbButton';

export default {
  components: { ConnectStreamingBanner, JbButton },

  props: ['playlistKey', 'loadingNextPage', 'isLoading'],

  computed: {
    items() {
      return this.$store.getters.playlistItems(this.playlistKey);
    },
    ...mapState({
      itemsExhausted(state) {
        return state.playlists[this.playlistKey].itemsExhausted;
      },
      hasLoadedInitialItems(state) {
        return state.playlists[this.playlistKey].hasLoadedInitialItems;
      },
    }),
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
ul.playlist-entries {
  list-style-type: none;
  padding-left: 0px;
  margin-top: 0px;
}

.load-page-button {
  width: 100%;
  padding: 20px 0;
  margin-top: 10px;
}
</style>
