<template>
  <sidebar-wrapper v-slot="{ withSidebar }">
    <main-wrapper :with-sidebar="withSidebar">
      <h2>your settings</h2>

      <h3>connect to streaming services</h3>

      <connect-streaming-section />

      <h3>connect to twitter</h3>

      <connect-twitter-section />

      <h3>color schemes</h3>

      <update-color-scheme />
    </main-wrapper>
  </sidebar-wrapper>
</template>

<script>
import MainWrapper from '../components/MainWrapper.vue';
import SidebarWrapper from '../components/SidebarWrapper.vue';
import titleMixin from '../util/titleMixin';

import ConnectStreamingSection from '../components/settings/ConnectStreamingSection.vue';
import ConnectTwitterSection from '../components/settings/ConnectTwitterSection.vue';
import UpdateColorScheme from '../components/settings/UpdateColorScheme.vue';

export default {
  components: {
    SidebarWrapper,
    MainWrapper,
    ConnectStreamingSection,
    ConnectTwitterSection,
    UpdateColorScheme,
  },

  mixins: [titleMixin],

  title: 'Settings',
};
</script>
