<template>
  <h1><slot /></h1>
</template>

<style lang="scss" scoped>
@import '~/assets/styles/mixins.scss';

h1 {
  line-height: $leading-none;
  margin-top: 0px;
  margin-bottom: $spacing-md;
  font-size: $text-2xl;
  font-weight: 600;

  @media (max-width: $breakpoint-small) {
    font-size: $text-xl;
    text-align: center;
  }
}
</style>
