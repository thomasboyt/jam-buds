<template>
  <button class="back-button" @click="handleBack">
    <icon class="icon" :glyph="chevronIcon" />
  </button>
</template>

<script>
import Icon from '~/components/Icon.vue';
const chevronIcon = require('~/assets/arrow.svg');

export default {
  components: { Icon },

  data() {
    return {
      chevronIcon,
    };
  },

  methods: {
    handleBack() {
      if (history.state.fromApp) {
        this.$router.back();
      } else {
        this.$router.push('/');
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.back-button {
  color: white;
  justify-self: left;

  .icon {
    fill: white;
    display: block;
    width: 30px;
    height: 30px;
    transform: rotate(90deg);
  }
}
</style>
