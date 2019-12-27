<template>
  <div v-if="searchResults">
    <div
      v-if="searchResults.length === 0"
      :style="{ textAlign: 'center', padding: '50px' }"
    >
      No results found!
    </div>

    <ul v-else data-test="search-results">
      <li v-for="song of searchResults" :key="song.spotifyId">
        <a href="#" @click="(evt) => handleSelectSong(evt, song)">
          <song-preview :song="song" />
        </a>
      </li>
    </ul>
  </div>
</template>

<script>
import SongPreview from './SongPreview.vue';

export default {
  components: { SongPreview },

  props: ['searchResults'],

  methods: {
    handleSelectSong(evt, song) {
      evt.preventDefault();

      this.$emit('selectedSong', song);
    },
  },
};
</script>

<style lang="scss" scoped>
ul {
  list-style: none;
  padding-left: 0;

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
