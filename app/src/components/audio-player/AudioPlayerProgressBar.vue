<template>
  <div class="progress-bar">
    <div class="progress-completed" :style="progressShadedStyle"></div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  props: {
    progress: {
      type: Number,
      required: true,
    },
  },

  computed: {
    cappedProgress(): number {
      return Math.min(1, this.progress);
    },
    progressShadedStyle(): Record<string, string> {
      return {
        transform: `scaleX(${this.cappedProgress})`,
      };
    },
  },
});
</script>

<style lang="scss" scoped>
.progress-bar {
  position: relative;
  width: 100%;
  height: 3px;
  background-color: #777;
}
.progress-completed {
  position: absolute;
  left: 0px;
  bottom: 0px;
  width: 100%;
  height: 100%;
  background-color: hotpink;
  transform-origin: 0 0;
}
</style>
