<template>
  <form
    :class="['search-box', { focused: searchFocused }]"
    @submit="handleSubmit"
  >
    <input
      type="text"
      v-model="searchInput"
      placeholder="Search..."
      data-test="song-url-field"
      ref="input"
      @focus="handleFocus"
      @blur="handleBlur"
    />

    <button class="search-button" type="submit">
      <icon :glyph="searchIcon" />
    </button>
  </form>
</template>

<script>
import Icon from '../Icon.vue';
const searchIcon = require('~/assets/search.svg');

export default {
  components: { Icon },

  data() {
    return {
      searchIcon,
      searchInput: '',
      searchFocused: false,
    };
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
      this.$refs.input.focus();
    }
  },

  methods: {
    handleSubmit(e) {
      e.preventDefault();
      this.$emit('submit', this.searchInput);
    },

    handleFocus() {
      this.searchFocused = true;
    },

    handleBlur() {
      this.searchFocused = false;
    },
  },
};
</script>

<style lang="scss" scoped>
.search-box {
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
