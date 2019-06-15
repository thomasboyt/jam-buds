<template>
  <div>
    <form class="submit-box" @submit="handleSubmit">
      <div class="input-container">
        <input
          type="text"
          :class="{ invalid }"
          v-model="songInput"
          @input="handleInput"
          placeholder="Search..."
          data-test="song-url-field"
        />
      </div>

      <button
        type="submit"
        :disabled="buttonDisabled"
        :class="['submit-search', 'cta-button', { invalid }]"
      >
        <span>is my shit</span>
      </button>
    </form>

    <spotify-results
      v-if="searchResults"
      :search-results="searchResults"
      @selectedSong="handleSelectSong"
    />
  </div>
</template>

<script>
import { getPlaybackSourceForUrl } from '../../playbackSources';
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

  methods: {
    handleInput() {
      this.invalid = false;
    },

    handleSelectSong(song) {
      this.$emit('selectedSong', song);
    },

    async handleSubmit(evt) {
      evt.preventDefault();

      if (this.songInput.startsWith('https://')) {
        if (!getPlaybackSourceForUrl(this.songInput)) {
          this.invalid = true;
          return;
        }
      }

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
