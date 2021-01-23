<template>
  <header>
    <intersect
      :threshold="[0.1, 0]"
      :root-margin="rootMargin"
      @enter="handleEnter"
      @leave="handleLeave"
    >
      <div class="intersect-bar" />
    </intersect>

    <h1>
      {{ title }}
    </h1>

    <div class="cta-container">
      <slot name="cta" />
    </div>
  </header>
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
@import '~/assets/styles/mixins.scss';

header {
  position: relative;
  display: flex;
  align-items: center;
  margin-bottom: 24px;

  > * {
    flex: 0 0 auto;
  }

  .cta-container {
    margin-left: auto;
  }
}

h1 {
  @include page-header();
}

.intersect-bar {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 0px;
}
</style>
