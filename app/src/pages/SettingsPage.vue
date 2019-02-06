<template>
  <sidebar-wrapper>
    <main-wrapper>
      <h2>your settings</h2>

      <h3>connect to streaming services</h3>

      <spotify-connect />

      <h3>connect to twitter</h3>

      <twitter-connect />

      <h3>color schemes</h3>

      <update-color-scheme />
    </main-wrapper>
  </sidebar-wrapper>
</template>

<script>
import MainWrapper from '../components/MainWrapper.vue';
import SidebarWrapper from '../components/SidebarWrapper.vue';
import titleMixin from '../util/titleMixin';

import SpotifyConnect from '../components/settings/SpotifyConnect.vue';
import TwitterConnect from '../components/settings/TwitterConnect.vue';
import UpdateColorScheme from '../components/settings/UpdateColorScheme.vue';

export default {
  components: {
    SidebarWrapper,
    MainWrapper,
    SpotifyConnect,
    TwitterConnect,
    UpdateColorScheme,
  },

  mixins: [titleMixin],

  title: 'Settings',
};
</script>
