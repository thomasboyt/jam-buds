<template>
  <div class="label">
    <div class="label-content">
      <div class="line-one"><slot name="line-one" /></div>
      <div class="line-two"><slot name="line-two" /></div>
    </div>

    <slot />
  </div>
</template>

<style lang="scss" scoped>
@import '~/assets/styles/mixins.scss';

.label {
  line-height: 1.5em;
  flex: 1 1 auto;
  overflow-x: hidden;

  .line-one,
  .line-two {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .line-one {
    font-weight: 500;
  }
}
</style>
