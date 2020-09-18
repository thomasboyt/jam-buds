<template>
  <div class="container">
    <sidebar :open="isSidebarOpen" />

    <div
      v-if="isSidebarOpen"
      class="modal-overlay"
      @click="handleClickSidebarOverlay"
    />

    <slot :with-sidebar="hasSidebar" />
  </div>
</template>

<script>
import Sidebar from './nav/Sidebar.vue';

export default {
  components: { Sidebar },

  computed: {
    isSidebarOpen() {
      return this.$store.state.isSidebarOpen;
    },

    hasSidebar() {
      return this.$store.state.auth.authenticated;
    },
  },

  methods: {
    handleClickSidebarOverlay() {
      this.$store.commit('closeSidebar');
    },
  },
};
</script>
