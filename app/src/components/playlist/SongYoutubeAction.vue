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
import getYoutubeSearchUrl from '~/util/getYoutubeSearchUrl';

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
      return getYoutubeSearchUrl(this.song);
    },
  },
};
</script>
