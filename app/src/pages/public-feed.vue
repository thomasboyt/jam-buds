<template>
  <sidebar-wrapper v-slot="{ withSidebar }">
    <main-wrapper :with-sidebar="withSidebar">
      <public-feed />
    </main-wrapper>
  </sidebar-wrapper>
</template>

<script>
import PublicFeed from '../components/PublicFeed.vue';

import MainWrapper from '../components/MainWrapper.vue';
import SidebarWrapper from '../components/SidebarWrapper.vue';

export default {
  components: {
    PublicFeed,
    MainWrapper,
    SidebarWrapper,
  },

  async asyncData({ store }) {
    await store.dispatch('loadPlaylist', {
      key: 'publicFeed',
      url: '/public-feed',
    });
  },
};
</script>
