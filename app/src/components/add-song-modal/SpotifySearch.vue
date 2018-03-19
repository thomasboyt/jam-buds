<template>
  <div>
    <form class="submit-box" @submit="handleSubmit">
      <div class="input-container">
        <input type="text" v-model="searchQuery" data-test="song-search-field" />
      </div>

      <button type="submit">find</button>
    </form>

    <div v-if="searchResults">
      <div v-if="searchResults.length === 0" :style="{textAlign: 'center', padding: '50px'}">
        No results found!
      </div>

      <ul v-else>
        <li v-for="song of searchResults" :key="song.id">
          <a href="#" @click="(evt) => handleSelectSong(evt, song)">
            {{song.artists.join(', ')}} - {{song.name}}
          </a>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import {mapState} from 'vuex';

export default {
  data() {
    return {
      searchQuery: '',
    };
  },

  computed: {
    ...mapState({
      searchResults: (state) => state.addSong.searchResults,
    }),
  },

  methods: {
    handleSubmit(evt) {
      evt.preventDefault();

      this.$store.dispatch('addSongSearch', this.searchQuery);
    },
    handleSelectSong(evt, song) {
      evt.preventDefault();

      this.$store.dispatch('addSongSelectResult', song);
    }
  },
}
</script>