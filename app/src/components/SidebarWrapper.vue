<template>
  <div class="container">
    <sidebar :open="isSidebarOpen"></sidebar>

    <div v-if="isSidebarOpen"
      class="container-overlay"
      @click="handleClickSidebarOverlay">
    </div>

    <slot></slot>
  </div>
</template>

<script>
import Sidebar from './Sidebar.vue';

export default {
  methods: {
    handleClickSidebarOverlay() {
      this.$store.commit('closeSidebar');
    },
  },

  computed: {
    isSidebarOpen() {
      return this.$store.state.isSidebarOpen;
    },
  },

  components: { Sidebar },
};
</script>
