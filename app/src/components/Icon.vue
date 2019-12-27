<template>
  <svg :class="`icon ${className || ''}`" :viewBox="glyph.viewBox">
    <use :xlink:href="`#${glyph.id}`" />
  </svg>
</template>

<script>
export default {
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
};
</script>
