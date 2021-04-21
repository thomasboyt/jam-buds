<template>
  <div>
    <jam-type-filter
      v-if="!isMixtapeSearch"
      :jam-type="jamType"
      @changeJamType="handleChangeJamType"
    />

    <create-mixtape v-if="jamType === 'mixtape'" />

    <template v-else>
      <form @submit="handleSubmitSearch">
        <new-jam-field :is-search="true" v-model="searchQuery" />
      </form>

      <search-results
        v-if="searchResults"
        :search-results="searchResults"
        @selectItem="handleSelectItem"
      />
      <div v-else class="search-placeholder">
        <p>Search for {{ jamTypeLabel }} or artist you like!</p>
        <p>(or, you can paste a Spotify, Apple Music, or Bandcamp link)</p>
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { ApiSchema } from '~/api/_helpers';
import SearchResults from './SearchResults.vue';
import NewJamField from './NewJamField.vue';
import JamTypeFilter from './JamTypeFilter.vue';
import CreateMixtape from './CreateMixtape.vue';
import {
  JamType,
  SearchResults as SearchResultsT,
  SelectedItem,
} from './common';

export default Vue.extend({
  components: {
    SearchResults,
    JamTypeFilter,
    NewJamField,
    CreateMixtape,
  },

  props: {
    isMixtapeSearch: {
      type: Boolean,
    },
  },

  data() {
    return {
      requestInFlight: false,
      searchResults: null as SearchResultsT | null,
      jamType: 'song' as JamType,
      searchQuery: '',
    };
  },

  computed: {
    jamTypeLabel(): string {
      return this.jamType === 'album' ? 'an album' : 'a song';
    },
  },

  methods: {
    handleChangeJamType(type: JamType) {
      this.jamType = type;
      this.searchResults = null;
      this.searchQuery = '';
    },

    handleSelectItem(item: SelectedItem) {
      this.$emit('selectItem', {
        item,
        type: this.jamType,
      });
    },

    async handleSubmitSearch(e: Event) {
      e.preventDefault();

      const query = this.searchQuery;
      if (!query || this.requestInFlight) {
        return;
      }

      this.requestInFlight = true;

      let resp;

      try {
        resp = await this.$axios({
          url: '/search',
          method: 'GET',
          params: { query, type: this.jamType },
        });
      } catch (err) {
        this.$accessor.showErrorModal();
        this.requestInFlight = false;
        throw err;
      }

      const data = resp.data as ApiSchema<'SearchResponse'>;
      this.searchResults = data.albums || data.songs!;

      this.requestInFlight = false;
    },
  },
});
</script>

<style lang="scss" scoped>
@import '~/assets/styles/mixins.scss';

.search-placeholder {
  padding: $spacing-3xl $spacing-md;
  text-align: center;
}
</style>
