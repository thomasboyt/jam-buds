<!-- via https://codepen.io/incyclum/pen/MqXmzo -->

<template>
  <button
    class="switch-button"
    type="button"
    :class="{ enabled: isEnabled }"
    :disabled="disableInteraction"
    @click="toggle"
  >
    <div class="inner-button"></div>
  </button>
</template>

<script>
export default {
  model: {
    prop: 'isEnabled',
    event: 'toggle',
  },
  props: {
    isEnabled: Boolean,
    disableInteraction: Boolean,
  },
  methods: {
    toggle: function() {
      this.$emit('toggle', !this.isEnabled);
    },
  },
};
</script>

<style lang="scss" scoped>
.switch-button {
  // reset default button styles
  padding: 0;
  &:active {
    transform: none;
  }

  $switch-button-height: 1.6em;
  $switch-button-color: currentColor;
  $switch-button-border-thickness: 2px;
  $switch-transition: all 0.3s ease-in-out;

  height: $switch-button-height;
  width: calc(#{$switch-button-height} * 2);
  border: $switch-button-border-thickness solid $switch-button-color;
  box-shadow: inset 0px 0px $switch-button-border-thickness 0px
    rgba(0, 0, 0, 0.33);
  border-radius: $switch-button-height;

  transition: $switch-transition;

  $button-side-length: calc(
    #{$switch-button-height} - (2 * #{$switch-button-border-thickness})
  );

  cursor: pointer;

  .inner-button {
    height: $button-side-length;
    width: $button-side-length;
    border-radius: $button-side-length;
    background: $switch-button-color;

    transition: $switch-transition;
  }

  &.enabled {
    background-color: $switch-button-color;
    box-shadow: none;

    .inner-button {
      background: white;
      transform: translateX(
        calc(#{$button-side-length} + (2 *#{$switch-button-border-thickness}))
      );
    }
  }
}
</style>
