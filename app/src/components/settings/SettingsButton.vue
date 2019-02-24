<template>
  <component
    :is="tag"
    :to="to"
    class="settings-button"
    :disabled="isSaving || disabled"
    @click="handleClick"
    ><slot
  /></component>
</template>

<script>
export default {
  props: {
    to: {
      type: String,
    },
    tag: {
      type: String,
      default: 'button',
    },
    isSaving: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },

  methods: {
    handleClick(evt) {
      this.$emit('click', evt);
    },
  },
};
</script>

<style lang="scss" scoped>
.settings-button {
  padding: 15px 25px;

  background: var(--theme-card-background-color);
  color: var(--theme-text-color);
  border: 3px var(--theme-text-color) solid;
  &:hover {
    background: var(--theme-card-background-color-hover);
  }

  display: inline-block;
  text-align: center;
  width: 260px;
  height: 56px;
  margin: 0 10px;
  text-decoration: none;

  &:disabled {
    cursor: default;

    &:active {
      transform: none;
    }
  }
}
</style>
