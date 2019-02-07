<template>
  <a :href="searchUrl" target="_blank" rel="noopener noreferrer">
    Find song on Youtube
  </a>
</template>

<script>
export default {
  props: ['song'],

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
