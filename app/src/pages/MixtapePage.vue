<template>
  <sidebar-wrapper v-slot="{ withSidebar }">
    <main-wrapper :with-sidebar="withSidebar">
      <h2>your mixtape</h2>

      <mixtape-viewer :mixtape-id="$route.params.id" />
    </main-wrapper>
  </sidebar-wrapper>
</template>

<script>
import MixtapeViewer from '../components/MixtapeViewer.vue';
import MainWrapper from '../components/MainWrapper.vue';
import SidebarWrapper from '../components/SidebarWrapper.vue';

export default {
  components: {
    MixtapeViewer,
    MainWrapper,
    SidebarWrapper,
  },

  async asyncData({ store, route }) {
    await store.dispatch('loadMixtape', route.params.id);
  },
};
</script>

<style lang="scss" scoped>
ul.playlist-entries {
  list-style-type: none;
  padding-left: 0px;
}
</style>

