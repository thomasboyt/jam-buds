<template>
  <a
    class="action-button"
    :href="searchUrl"
    target="_blank"
    rel="noopener noreferrer"
    title="Find on Youtube"
  >
    <icon :glyph="youtubeIcon" />
  </a>
</template>

<script>
import Icon from '../Icon.vue';

const youtubeIcon = require('~/assets/youtube.svg');

export default {
  components: { Icon },

  props: ['song'],

  data() {
    return {
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
};
</script>
