<template>
  <component
    :is="tag"
    :to="to"
    :class="['jb-button', buttonStyle]"
    :disabled="disabled"
    @click="handleClick"
  >
    <span class="label">
      <slot />
    </span>
  </component>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  props: {
    to: {
      type: String,
    },
    tag: {
      type: String,
      default: 'button',
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    buttonStyle: {
      type: String,
      default: 'hollow',
    },
  },

  methods: {
    handleClick(evt: Event) {
      this.$emit('click', evt);
    },
  },
});
</script>

<style lang="scss" scoped>
@import '~/assets/styles/mixins.scss';

.jb-button {
  font-weight: 500;
  // default padding - easy to override
  padding: 15px 25px;

  display: inline-block;
  text-align: center;
  border-radius: 9999px;
  text-decoration: none;

  &:disabled {
    cursor: default;
    opacity: 0.5;

    &:active {
      transform: none;
    }
  }

  &.hollow {
    color: currentColor;
    border: 2px currentColor solid;
    &:hover {
      background: rgba(0, 0, 0, 0.1);
    }
  }

  &.page-action {
    font-size: 20px;
    font-weight: 600;
    background: $black;

    .label {
      background: $post-song-gradient;
      -webkit-background-clip: text;
      background-clip: text;
      color: rgba(255, 255, 255, 0.2);
    }
    &:hover .label {
      color: rgba(255, 255, 255, 0.5);
    }
  }

  &.full-width {
    width: 100%;
  }
}
</style>
