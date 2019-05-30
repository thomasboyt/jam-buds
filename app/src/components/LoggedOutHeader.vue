<template>
  <div class="logged-out-header">
    <div class="logo-container">
      <logo />
    </div>
  </div>
</template>

<script>
import Logo from './Logo.vue';
export default {
  components: { Logo },
};
</script>


<style lang="scss">
@import '../../styles/mixins.scss';

.logged-out-header {
  margin-bottom: 40px;
  text-align: center;

  @media (max-width: $breakpoint-small) {
    display: none;
  }
}
</style>