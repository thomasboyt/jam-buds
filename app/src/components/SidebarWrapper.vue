<template>
  <div class="container">
    <sidebar :open="isSidebarOpen" />

    <div
      v-if="isSidebarOpen"
      class="container-overlay"
      @click="handleClickSidebarOverlay"
    />

    <slot />
  </div>
</template>

<script>
import Sidebar from './Sidebar.vue';

export default {
  components: { Sidebar },

  computed: {
    isSidebarOpen() {
      return this.$store.state.isSidebarOpen;
    },
  },
  methods: {
    handleClickSidebarOverlay() {
      this.$store.commit('closeSidebar');
    },
  },
};
</script>
