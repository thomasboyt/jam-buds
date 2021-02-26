<template>
  <span class="menu-container" ref="menuContainer">
    <button class="action-button" @click="handleToggleMenu">
      <icon :glyph="dropdownIcon" />
    </button>

    <div :class="{ dropdown: true, open: isOpen }">
      <ul class="menu" @click="handleClickItem">
        <slot />
      </ul>
    </div>
  </span>
</template>

<script>
import Icon from '../Icon.vue';
import dropdownIcon from '~/assets/kebab-vertical.svg';

export default {
  components: { Icon },

  data() {
    return {
      dropdownIcon,
      isOpen: false,
    };
  },

  mounted() {
    document
      .querySelector('html')
      .addEventListener('click', this.handleClickOutside);
  },

  beforeDestroy() {
    document
      .querySelector('html')
      .removeEventListener('click', this.handleClickOutside);
  },

  methods: {
    handleToggleMenu() {
      this.isOpen = !this.isOpen;
    },

    handleClickOutside(e) {
      if (!this.$refs.menuContainer.contains(e.target)) {
        this.isOpen = false;
      }
    },

    handleClickItem(e) {
      this.isOpen = false;
      e.stopPropagation();
    },
  },
};
</script>

<style scoped lang="scss">
.menu-container {
  position: relative;
}

.dropdown {
  position: absolute;
  top: 20px;
  right: 0;
  z-index: 5;

  display: none;
  &.open {
    display: block;
  }
}

ul.menu {
  margin: 0;
  padding: 10px 0;
  list-style: none;
  width: auto;
  background: white;
  border-radius: 4px;
  box-shadow: 1px 1px 4px rgba(0, 0, 0, 0.25);
}
</style>
