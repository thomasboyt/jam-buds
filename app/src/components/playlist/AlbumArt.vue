<template>
  <img v-if="albumArt" class="playlist-entry--album-art" :src="albumArt">
  <icon v-else class="playlist-entry--album-art -placeholder" :glyph="albumPlaceholderIcon"/>
</template>

<script>
import Icon from '../Icon.vue';
const albumPlaceholderIcon = require('../../../assets/record.svg');

export default {
  components: { Icon },

  props: ['albumArt'],

  data() {
    return {
      albumPlaceholderIcon,
    };
  },
};
</script>
