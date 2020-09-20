<template>
  <div :class="['logged-out-header', {'hide-mobile': !showMobile}]">
    <div class="logo-container">
      <logo />
    </div>
  </div>
</template>

<script>
import Logo from './Logo.vue';
export default {
  components: { Logo },
  props: ['showMobile'],
};
</script>

<style lang="scss">
@import '~/assets/styles/mixins.scss';

.logged-out-header {
  margin-bottom: 40px;
  text-align: center;

  &.hide-mobile {
    @media (max-width: $breakpoint-small) {
      display: none;
    }
  }
}
</style>
