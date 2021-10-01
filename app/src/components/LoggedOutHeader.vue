<template>
  <div :class="['logged-out-header', { 'hide-mobile': !showMobile }]">
    <div class="logo-container">
      <logo />
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Logo from './Logo.vue';

export default Vue.extend({
  components: { Logo },
  props: {
    showMobile: {
      type: Boolean,
    },
  },
});
</script>

<style lang="scss">
@import '~/assets/styles/mixins.scss';

.logged-out-header {
  margin-bottom: $spacing-2xl;
  text-align: center;

  &.hide-mobile {
    @media (max-width: $breakpoint-small) {
      display: none;
    }
  }
}
</style>
