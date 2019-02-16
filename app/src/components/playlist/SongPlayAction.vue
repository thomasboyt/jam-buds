<template>
  <button
    v-if="canPlay"
    class="action-button"
    @click="handlePlay"
    type="button"
  >
    <icon :glyph="playIcon" />
  </button>

  <a
    v-else
    class="action-button"
    :href="searchUrl"
    target="_blank"
    rel="noopener noreferrer"
  >
    <!-- TODO: youtube icon -->
    <icon :glyph="youtubeIcon" />
  </a>
</template>

<script>
import { mapState } from 'vuex';
import Icon from '../Icon.vue';

const playIcon = require('../../../assets/play-outline.svg');
const youtubeIcon = require('../../../assets/youtube.svg');

export default {
  components: { Icon },

  props: ['song'],

  data() {
    return {
      playIcon,
      youtubeIcon,
    };
  },

  computed: {
    ...mapState({
      canPlay: (state) =>
        state.auth.authenticated && state.currentUser.hasSpotify,
    }),

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
