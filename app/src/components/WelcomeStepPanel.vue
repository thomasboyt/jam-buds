<template>
  <div class="welcome-step">
    <slot />
  </div>
</template>

<style lang="scss" scoped>
@import '~/assets/styles/mixins.scss';

.welcome-step {
  max-width: 768px;
  border-radius: $spacing-sm;
  padding: $spacing-md;
  margin: 0 auto;
  text-align: center;

  @media (min-width: $breakpoint-small) {
    background: rgba(0, 0, 0, 0.05);
  }
}
</style>
