<template>
  <h1><slot /></h1>
</template>

<style lang="scss" scoped>
@import '~/assets/styles/mixins.scss';

h1 {
  line-height: 1em;
  margin-top: 0px;
  margin-bottom: 20px;
  font-size: 48px;
  font-weight: 600;

  @media (max-width: $breakpoint-small) {
    font-size: 30px;
    text-align: center;
  }
}
</style>
