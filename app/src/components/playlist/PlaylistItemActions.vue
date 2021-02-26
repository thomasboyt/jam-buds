<template>
  <div class="actions">
    <slot />
  </div>
</template>

<style lang="scss" scoped>
@import '~/assets/styles/mixins.scss';

.actions {
  flex-grow: 0;
  flex-shrink: 0;
  margin-left: auto;

  display: flex;

  > * {
    flex: 0 0 auto;
  }
}

::v-deep .action-button {
  border-radius: 500px;
  padding: 8px;

  .icon {
    display: block;
    width: 25px;
    height: 25px;
  }

  svg {
    color: var(--theme-text-color);
  }

  &:hover {
    background: rgba(0, 0, 0, 0.1);
  }

  &:disabled {
    cursor: default;
    &:hover {
      background: none;
    }
  }
  @media (max-width: $breakpoint-small) {
    padding: 0;

    &:hover {
      background: none;
    }
  }
}
</style>
