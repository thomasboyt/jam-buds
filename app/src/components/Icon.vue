<template>
  <span :class="`icon ${className || ''}`" v-html="glyph"></span>
</template>

<script>
  export default {
    props: {
      className: {
        type: String,
        default: () => '',
      },
      glyph: {
        type: String,
        required: true,
      },
    },
  }
</script>