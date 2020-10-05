<template>
  <div>
    <form class="submit-box" @submit="handleSubmitForm">
      <div class="input-container">
        <input
          type="text"
          :class="{ invalid }"
          v-model="songInput"
          @input="handleInput"
          placeholder="Search..."
          data-test="song-url-field"
          ref="input"
        />
      </div>

      <button
        type="submit"
        :disabled="buttonDisabled"
        :class="['submit-search', 'cta-button', { invalid }]"
      >
        <span>find</span>
      </button>
    </form>

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

export default {
  components: { SpotifyResults },

  data() {
    return {
      songInput: '',
      invalid: false,
      requestInFlight: false,
      searchResults: null,
    };
  },

  computed: {
    buttonDisabled() {
      return this.songInput === '' || this.invalid || this.requestInFlight;
    },
  },

  mounted() {
    if (this.$store.state.addSong.initialSearch) {
      this.songInput = this.$store.state.addSong.initialSearch;
      this.handleSubmit();
    } else {
      // iOS Safari freaks out trying to animate the modal when opening
      // the keyboard, since viewport height changes and stuff.
      //
      // unfortunately can't just focus-on-delay because iOS Safari has a bunch
      // of weird heuristics preventing autofocus when it's not from a user
      // event. should eventually update the design to make it easier to tap in
      const iOS =
        window.navigator.userAgent.includes('iPhone') ||
        window.navigator.userAgent.includes('iPad');

      if (!iOS) {
        this.$refs.input.focus();
      }
    }
  },

  methods: {
    handleInput() {
      this.invalid = false;
    },

    handleSelectSong(song) {
      this.$emit('selectedSong', song);
    },

    handleSubmitForm(e) {
      e.preventDefault();
      this.handleSubmit();
    },

    async handleSubmit() {
      this.requestInFlight = true;

      let resp;

      try {
        resp = await this.$axios({
          url: '/spotify-search',
          method: 'GET',
          params: { query: this.songInput },
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
