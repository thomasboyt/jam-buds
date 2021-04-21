<template>
  <div v-if="searchResults">
    <div
      v-if="searchResults.length === 0"
      :style="{ textAlign: 'center', padding: '50px' }"
    >
      No results found!
    </div>

    <ul v-else data-test="search-results">
      <li v-for="item of searchResults" :key="item.key">
        <a href="#" @click="(evt) => handleSelectItem(evt, item)">
          <search-item-preview :item="item" />
        </a>
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import SearchItemPreview from './SearchItemPreview.vue';
import { SearchResults, SelectedItem } from './common';

export default Vue.extend({
  components: { SearchItemPreview },

  props: {
    searchResults: {
      type: Array as PropType<SearchResults>,
    },
  },

  methods: {
    handleSelectItem(evt: Event, item: SelectedItem) {
      evt.preventDefault();

      this.$emit('selectItem', item);
    },
  },
});
</script>

<style lang="scss" scoped>
ul {
  padding: 20px 0;
  a {
    display: block;
    margin-bottom: 10px;

    &:hover,
    &:active {
      background: rgba(255, 255, 255, 0.1);
    }
  }
}
</style>
