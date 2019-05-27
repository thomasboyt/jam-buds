<template>
  <span class="menu-container" ref="menuContainer">
    <button class="action-button" @click="handleToggleMenu">
      <icon :glyph="dropdownIcon" />
    </button>

    <div :class="{ dropdown: true, open: isOpen }">
      <ul class="menu">
        <li class="menu-item">
          <a
            :href="spotifyUrl"
            target="_blank"
            rel="noopener noreferrer"
            @click="handleClickItem"
            >Open in Spotify</a
          >
        </li>
        <li class="menu-item" v-if="song.appleMusicUrl">
          <a
            :href="song.appleMusicUrl"
            target="_blank"
            rel="noopener noreferrer"
            @click="handleClickItem"
            >Open in Apple Music</a
          >
        </li>
        <!-- <li class="menu-item">
          <button @click="handleClickDelete">Delete</button>
        </li> -->
      </ul>
    </div>
  </span>
</template>

<script>
import Icon from '../Icon.vue';

import dropdownIcon from '../../../assets/kebab-vertical.svg';

export default {
  components: { Icon },

  props: ['song'],

  data() {
    return {
      dropdownIcon,
      isOpen: false,
    };
  },

  computed: {
    spotifyUrl() {
      return `https://open.spotify.com/track/${this.song.spotifyId}`;
    },
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

    handleClickItem() {
      this.isOpen = false;
    },

    // handleClickDelete() {},
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

  li {
    a,
    a:visited,
    button {
      display: block;
      white-space: nowrap;
      padding: 5px 20px;
      font-size: 14px;
      color: rgb(100, 100, 100);
      width: 100%;
      text-align: left;
      text-decoration: none;

      &:hover {
        background: rgb(225, 225, 225);
      }

      &:active {
        transform: none;
      }
    }
  }
}
</style>
