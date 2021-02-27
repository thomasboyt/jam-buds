<template>
  <div>
    <search-type-filter
      v-if="!isMixtapeSearch"
      :search-type="searchType"
      @changeSearchType="handleChangeSearchType"
    />
    <search-form @submit="handleSubmit" />

    <spotify-results
      v-if="searchResults"
      :search-results="searchResults"
      @selectItem="handleSelectItem"
    />
    <div v-else class="search-placeholder">
      <p>Search for a song or artist you like!</p>
    </div>
  </div>
</template>

<script>
import SpotifyResults from './SpotifyResults.vue';
import SearchForm from './SearchForm.vue';
import SearchTypeFilter from './SearchTypeFilter.vue';

export default {
  components: { SpotifyResults, SearchForm, SearchTypeFilter },

  props: ['isMixtapeSearch'],

  data() {
    return {
      requestInFlight: false,
      searchResults: null,
      searchType: 'song',
    };
  },

  methods: {
    handleChangeSearchType(type) {
      this.searchType = type;
      this.searchResults = null;
    },

    handleSelectItem(item) {
      this.$emit('selectItem', {
        item,
        type: this.searchType,
      });
    },

    async handleSubmit(query) {
      if (!query || this.requestInFlight) {
        return;
      }

      this.requestInFlight = true;

      let resp;

      try {
        resp = await this.$axios({
          url: '/search',
          method: 'GET',
          params: { query, type: this.searchType },
        });
      } catch (err) {
        this.$store.commit('showErrorModal');
        this.requestInFlight = false;
        throw err;
      }

      this.searchResults = resp.data.albums || resp.data.songs;

      this.requestInFlight = false;
    },
  },
};
</script>

<style lang="scss" scoped>
.search-placeholder {
  padding: 50px;
  text-align: center;
}
</style>
