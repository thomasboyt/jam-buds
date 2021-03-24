<!-- via twitter bootstrap
https://getbootstrap.com/docs/4.4/components/spinners/ -->

<template>
  <div class="spinner-border" role="status">
    <span class="sr-only">Loading...</span>
  </div>
</template>

<style lang="scss" scoped>
@import '~/assets/styles/mixins.scss';

// TODO: make configurable?
$spinner-width: 24px;
$spinner-height: 24px;
$spinner-border-width: 3px;
$spinner-animation-speed: 0.75s;

.sr-only {
  @include visually-hidden();
}

@keyframes spinner-border {
  to {
    transform: rotate(360deg);
  }
}

.spinner-border {
  display: inline-block;
  width: $spinner-width;
  height: $spinner-height;
  vertical-align: text-bottom;
  border: $spinner-border-width solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
  animation: spinner-border $spinner-animation-speed linear infinite;
}
</style>
