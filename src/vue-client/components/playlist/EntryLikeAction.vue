<template>
  <button @click="handleToggleLike" :disabled="requestInFlight">
    <icon v-if="entry.isLiked" :glyph="heartFilledIcon"></icon>
    <icon v-else :glyph="heartOpenIcon"></icon>
  </button>
</template>

<script>
import Icon from '../Icon.vue';

const heartOpenIcon = require('../../../../assets/heart_open.svg');
const heartFilledIcon = require('../../../../assets/heart_filled.svg');

export default {
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

      const action = this.entry.isLiked ? 'unlikePlaylistEntry' : 'likePlaylistEntry';

      this.requestInFlight = true;

      try {
        await this.$store.dispatch(`${action}`, {id: this.entry.id});
      } catch(err) {
        console.log('request error');
        console.log(err);
      } finally {
        this.requestInFlight = false;
      }
    },
  },

  components: {Icon},
}
</script>