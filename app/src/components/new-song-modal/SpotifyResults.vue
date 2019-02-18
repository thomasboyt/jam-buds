<template>
  <div v-if="searchResults">
    <div
      v-if="searchResults.length === 0"
      :style="{ textAlign: 'center', padding: '50px' }"
    >
      No results found!
    </div>

    <ul v-else data-test="search-results">
      <li v-for="song of searchResults" :key="song.id">
        <a href="#" @click="(evt) => handleSelectSong(evt, song)">
          {{ song.artists.join(', ') }} - {{ song.title }}
        </a>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  props: ['searchResults'],

  methods: {
    handleSelectSong(evt, song) {
      evt.preventDefault();

      this.$emit('selectedSong', song);
    },
  },
};
</script>
