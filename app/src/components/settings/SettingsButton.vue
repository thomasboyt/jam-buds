<template>
  <component
    :is="tag"
    :to="to"
    class="button settings-button"
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

  color: var(--theme-text-color);
  border: 2px var(--theme-text-color) solid;
  &:hover {
    background: rgba(0, 0, 0, 0.1);
  }

  display: inline-block;
  text-align: center;
  width: 250px;
  height: 56px;
  text-decoration: none;

  &:disabled {
    cursor: default;

    &:active {
      transform: none;
    }
  }
}
</style>
