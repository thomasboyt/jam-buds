<template>
  <button
    v-if="authenticated"
    class="sidebar-toggle"
    @click="handleOpenSidebar"
  >
    <icon :glyph="menuIcon" />
  </button>
</template>

<script>
const menuIcon = require('~/assets/menu.svg');
import Icon from './Icon.vue';

export default {
  components: { Icon },

  data() {
    return {
      menuIcon,
    };
  },

  computed: {
    authenticated() {
      return this.$store.state.auth.authenticated;
    },
    isSidebarOpen() {
      return this.$store.state.isSidebarOpen;
    },
  },

  methods: {
    handleOpenSidebar() {
      if (this.isSidebarOpen) {
        this.$store.commit('closeSidebar');
      } else {
        this.$store.commit('openSidebar');
      }
    },
  },
};
</script>
