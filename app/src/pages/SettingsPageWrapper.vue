<template>
  <sidebar-wrapper v-slot="{ withSidebar }">
    <main-wrapper :with-sidebar="withSidebar">
      <h2>your settings</h2>

      <link-tabs link-prefix="/settings" :links="navLinks" />

      <div :style="{ marginTop: '30px' }">
        <router-view />
      </div>
    </main-wrapper>
  </sidebar-wrapper>
</template>

<script>
import MainWrapper from '../components/MainWrapper.vue';
import SidebarWrapper from '../components/SidebarWrapper.vue';
import LinkTabs from '../components/LinkTabs.vue';

export default {
  components: {
    SidebarWrapper,
    MainWrapper,
    LinkTabs,
  },

  data() {
    return {
      navLinks: [
        { to: '', label: 'Connections' },
        { to: '/profile', label: 'Profile' },
      ],
    };
  },

  metaInfo: {
    title: 'Settings',
  },
};
</script>
