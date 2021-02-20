<template>
  <div>
    <search-form @submit="handleSubmit" />

    <spotify-results
      v-if="searchResults"
      :search-results="searchResults"
      @selectedSong="handleSelectSong"
    />
    <div v-else class="search-placeholder">
      <p>Search for a song or artist you like!</p>
    </div>
  </div>
</template>

<script>
import SpotifyResults from './SpotifyResults.vue';
import SearchForm from './SearchForm.vue';

export default {
  components: { SpotifyResults, SearchForm },

  data() {
    return {
      requestInFlight: false,
      searchResults: null,
    };
  },

  methods: {
    handleSelectSong(song) {
      this.$emit('selectedSong', song);
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
          params: { query, type: 'songs' },
        });
      } catch (err) {
        this.$store.commit('showErrorModal');
        this.requestInFlight = false;
        throw err;
      }

      this.searchResults = resp.data.songs;

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
