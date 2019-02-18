<template>
  <a :href="searchUrl" target="_blank" rel="noopener noreferrer">
    Find song on Youtube
  </a>
</template>

<script>
import getYoutubeSearchUrl from '../../util/getYoutubeSearchUrl';

export default {
  props: ['song'],

  computed: {
    searchUrl() {
      return getYoutubeSearchUrl(this.song);
    },
  },
};
</script>
