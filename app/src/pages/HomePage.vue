<template>
  <sidebar-wrapper v-if="authenticated" v-slot="{ withSidebar }">
    <main-wrapper :with-sidebar="withSidebar">
      <feed />
    </main-wrapper>
  </sidebar-wrapper>

  <logged-out-home v-else />
</template>

<script>
import { mapState } from 'vuex';
import Feed from '../components/Feed.vue';
import LoggedOutHome from '../components/LoggedOutHome.vue';

import MainWrapper from '../components/MainWrapper.vue';
import SidebarWrapper from '../components/SidebarWrapper.vue';

export default {
  components: {
    Feed,
    MainWrapper,
    SidebarWrapper,
    LoggedOutHome,
  },

  async asyncData({ store }) {
    if (store.state.auth.authenticated) {
      await store.dispatch('loadPlaylistPage', { key: 'feed', initial: true });
    }
  },

  computed: mapState({
    authenticated: (state) => state.auth.authenticated,
  }),
};
</script>
