<template>
  <song-action-button v-if="canPlay" :icon="playIcon" @click="handlePlay">
    Play
  </song-action-button>

  <song-action-button
    v-else
    :icon="youtubeIcon"
    tag="a"
    :href="searchUrl"
    target="_blank"
    rel="noopener noreferrer"
    title="Find on Youtube"
  >
    Find on Youtube
  </song-action-button>
</template>

<script>
import SongActionButton from './SongActionButton.vue';

const playIcon = require('../../../assets/play-outline.svg');
const youtubeIcon = require('../../../assets/youtube.svg');

export default {
  components: { SongActionButton },

  props: ['song', 'canPlay'],

  data() {
    return {
      playIcon,
      youtubeIcon,
    };
  },

  computed: {
    searchUrl() {
      const query = encodeURIComponent(
        this.song.artists[0] + ' ' + this.song.title
      );
      return `https://www.youtube.com/results?search_query=${query}`;
    },
  },

  methods: {
    handlePlay(e) {
      e.preventDefault();
      this.$emit('play');
    },
  },
};
</script>
