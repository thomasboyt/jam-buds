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

      <spotify-results
        v-if="searchResults"
        :search-results="searchResults"
        @selectItem="handleSelectItem"
      />
      <div v-else class="search-placeholder">
        <p>Search for {{ jamTypeLabel }} or artist you like!</p>
      </div>
    </template>
  </div>
</template>

<script>
import SpotifyResults from './SpotifyResults.vue';
import NewJamField from './NewJamField.vue';
import JamTypeFilter from './JamTypeFilter.vue';
import CreateMixtape from './CreateMixtape.vue';

export default {
  components: {
    SpotifyResults,
    JamTypeFilter,
    NewJamField,
    CreateMixtape,
  },

  props: ['isMixtapeSearch'],

  data() {
    return {
      requestInFlight: false,
      searchResults: null,
      jamType: 'song',
      searchQuery: '',
    };
  },

  computed: {
    jamTypeLabel() {
      return this.jamType === 'album' ? 'an album' : 'a song';
    },
  },

  methods: {
    handleChangeJamType(type) {
      this.jamType = type;
      this.searchResults = null;
      this.searchQuery = '';
    },

    handleSelectItem(item) {
      this.$emit('selectItem', {
        item,
        type: this.jamType,
      });
    },

    async handleSubmitSearch(e) {
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