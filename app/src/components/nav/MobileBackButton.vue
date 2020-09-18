<template>
  <button class="back-button" @click="handleBack">
    <icon class="icon" :glyph="chevronIcon" />
  </button>
</template>

<script>
const chevronIcon = require('~/assets/arrow.svg');
import Icon from '~/components/Icon.vue';

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
