<template>
  <button @click="handleToggleLike" :disabled="requestInFlight">
    <icon v-if="entry.song.isLiked" :glyph="heartFilledIcon" />
    <icon v-else :glyph="heartOpenIcon" />
  </button>
</template>

<script>
import Icon from '../Icon.vue';

const heartOpenIcon = require('../../../assets/heart_open.svg');
const heartFilledIcon = require('../../../assets/heart_filled.svg');

export default {
  components: { Icon },

  props: ['entry'],

  data() {
    return {
      heartOpenIcon,
      heartFilledIcon,
      requestInFlight: false,
    };
  },

  methods: {
    async handleToggleLike(e) {
      e.preventDefault();
      e.stopPropagation();

      const action = this.entry.song.isLiked
        ? 'unlikePlaylistEntry'
        : 'likePlaylistEntry';

      this.requestInFlight = true;

      try {
        await this.$store.dispatch(`${action}`, { id: this.entry.id });
      } catch (err) {
        console.log('request error');
        console.log(err);
      } finally {
        this.requestInFlight = false;
      }
    },
  },
};
</script>
