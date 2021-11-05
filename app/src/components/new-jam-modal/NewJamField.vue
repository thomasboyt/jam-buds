<template>
  <div :class="['new-jam-field', { focused }]">
    <input
      type="text"
      data-test="new-jam-field"
      ref="input"
      :value="value"
      :aria-label="label"
      :placeholder="placeholder"
      @input="$emit('input', $event.target.value)"
      @focus="focused = true"
      @blur="focused = false"
    />

    <button v-if="isSearch" class="search-button" type="submit">
      <icon :glyph="searchIcon" />
    </button>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Icon from '../Icon.vue';

import searchIcon from '~/assets/search.svg';

export default Vue.extend({
  components: { Icon },

  props: {
    value: {
      type: String,
    },
    isSearch: {
      type: Boolean,
    },
  },

  data() {
    return {
      focused: false,
      searchIcon,
    };
  },

  computed: {
    placeholder(): string {
      return this.isSearch ? 'Search...' : 'Your mixtape title';
    },
    label(): string {
      return this.isSearch ? 'Search query' : 'Mixtape title';
    },
  },

  mounted() {
    // iOS Safari freaks out trying to animate the modal when opening
    // the keyboard, since viewport height changes and stuff.
    //
    // unfortunately can't just focus-on-delay because iOS Safari has a bunch
    // of weird heuristics preventing autofocus when it's not from a user
    // event. should eventually update the design to make it easier to tap in
    const iOS =
      window.navigator.userAgent.includes('iPhone') ||
      window.navigator.userAgent.includes('iPad');

    if (!iOS) {
      const input = this.$refs.input as HTMLInputElement;
      input.focus();
    }
  },
});
</script>

<style lang="scss" scoped>
.new-jam-field {
  display: flex;
  height: 50px;

  // 0px here keeps it from getting a weird thing specified by input, I guess?
  background: rgba(255, 255, 255, 0.2);
  border: 1px #777 solid;
  border-radius: 9999px;

  &.focused {
    border-color: hotpink;
  }
}

input {
  flex: 1 0 auto;
  height: 100%;
  margin-left: 20px;
  font-size: 16px;
  border: none;

  background: transparent;
  color: currentColor;

  &:focus {
    // visual state covered by search box focus
    outline: none;
  }
}

.search-button {
  flex: 0 0 auto;
  padding-left: 10px;
  padding-right: 20px;
  line-height: 100%;
  color: inherit;

  .icon {
    width: 20px;
    height: 20px;
  }
}
</style>
