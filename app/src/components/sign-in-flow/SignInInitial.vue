<template>
  <div>
    <slot name="initial-copy" />

    <jb-button
      data-test="get-started-button"
      button-style="page-action full-width"
      @click="handleCtaClick"
      >get started</jb-button
    >
  </div>
</template>

<script>
import JbButton from '../lib/JbButton.vue';

export default {
  components: { JbButton },

  methods: {
    handleCtaClick() {
      this.$emit('ctaClicked');
    },
  },
};
</script>
