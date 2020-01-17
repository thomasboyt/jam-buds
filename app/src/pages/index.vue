<template>
  <sidebar-wrapper v-if="authenticated" v-slot="{ withSidebar }">
    <main-wrapper :with-sidebar="withSidebar">
      <panel>
        <strong>jan 17:</strong> spotify playback is currently buggy due to
        <a href="https://github.com/spotify/web-playback-sdk/issues/99"
          >an issue i'm pretty sure is not my fault</a
        >. if you're having trouble getting a song to play, try using the "find
        on youtube" option instead!
      </panel>
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
import Panel from '../components/Panel.vue';

export default {
  components: {
    Feed,
    MainWrapper,
    SidebarWrapper,
    LoggedOutHome,
    Panel,
  },

  head() {
    return {
      meta: [
        { name: 'twitter:card', content: 'summary' },
        { hid: 'title', name: 'og:title', content: 'jam buds!' },
        {
          hid: 'description',
          name: 'og:description',
          content: 'a place for sharing music with your friends!',
        },
        {
          name: 'og:image',
          content: `${process.env.STATIC_URL}/corgi_icon_square.png`,
        },
      ],
    };
  },

  async fetch({ store }) {
    if (store.state.auth.authenticated) {
      await Promise.all([
        store.dispatch('loadPlaylist', { key: 'feed', url: '/feed' }),
        store.dispatch('notifications/load'),
      ]);
    }
  },

  computed: mapState({
    authenticated: (state) => state.auth.authenticated,
  }),
};
</script>
