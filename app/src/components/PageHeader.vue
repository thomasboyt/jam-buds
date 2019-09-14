<template>
  <h2>
    <intersect
      :threshold="[0.1, 0]"
      :root-margin="rootMargin"
      @enter="handleEnter"
      @leave="handleLeave"
    >
      <div class="intersect-bar" />
    </intersect>
    {{ title }}
  </h2>
</template>

<script>
import Intersect from './Intersect';

export default {
  components: { Intersect },
  props: ['title'],

  data() {
    return {
      // Keep this in sync with top bar height
      rootMargin: '-60px 0px 0px 0px',
    };
  },

  beforeDestroy() {
    this.$store.commit('hideMobileHeaderTitle');
  },

  methods: {
    handleEnter() {
      this.$store.commit('hideMobileHeaderTitle');
    },
    handleLeave() {
      this.$store.commit('showMobileHeaderTitle', {
        title: this.title,
      });
    },
  },
};
</script>

<style lang="scss" scoped>
h2 {
  position: relative;
}

.intersect-bar {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 0px;
}
</style>
