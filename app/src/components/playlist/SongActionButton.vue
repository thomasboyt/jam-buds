<template>
  <component
    :is="tag"
    :to="to"
    class="button action-button"
    :disabled="isSaving || disabled"
    @click="handleClick"
  >
    <icon :glyph="icon" />
    <span class="label"><slot /></span>
  </component>
</template>

<script>
import Icon from '../Icon.vue';

export default {
  components: { Icon },

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
    icon: {
      type: Object,
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
.action-button {
  font-size: 14px;
  border-radius: 500px;
  padding: 4px 10px;
  text-decoration: none;
  border: 1px var(--theme-text-color) solid;
  margin-right: 10px;

  // play button?
  // background: #333;
  // color: #fafafa;
  // svg {
  //   color: #fafafa;
  // }

  display: flex;
  align-items: center;

  svg {
    flex: 0 0 auto;
  }

  .label {
    margin-left: 10px;
    flex: 1 0 auto;
  }

  .icon {
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
}
</style>
