<template>
  <svg :class="`icon ${className || ''}`" :viewBox="glyph.viewBox">
    <use :xlink:href="`#${glyph.id}`" />
  </svg>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  props: {
    className: {
      type: String,
      default: () => '',
    },
    glyph: {
      type: Object,
      required: true,
    },
  },
});
</script>
