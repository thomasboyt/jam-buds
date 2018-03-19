<template>
  <img v-if="albumArt" class="playlist-entry--album-art" :src="albumArt">
  <icon v-else class="playlist-entry--album-art -placeholder" :glyph="albumPlaceholderIcon"></icon>
</template>

<script>
import Icon from '../Icon.vue';
const albumPlaceholderIcon = require('../../../assets/record.svg');

export default {
  props: ['albumArt'],

  data() {
    return {
      albumPlaceholderIcon,
    };
  },

  components: { Icon },
};
</script>
