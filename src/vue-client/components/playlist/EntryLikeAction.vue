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
    };
  },

  computed: {
    // TODO: unstub this
    requestInFlight() { return false; },
  },

  methods: {
    handleToggleLike(e) {
      e.preventDefault();
      e.stopPropagation();

      if (this.entry.isLiked) {
        // TODO
      } else {
        // TODO
      }
    },
  },

  components: {Icon},
}
</script>