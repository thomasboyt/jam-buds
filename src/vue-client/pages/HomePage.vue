<template>
  <sidebar-wrapper v-if="authenticated">
    <main-wrapper>
      <feed></feed>
    </main-wrapper>
  </sidebar-wrapper>

  <logged-out-home v-else></logged-out-home>
</template>

<script>
  import {mapState} from 'vuex';
  import Feed from '../components/Feed.vue';
  import LoggedOutHome from '../components/LoggedOutHome.vue';

  import AppContainer from '../components/AppContainer.vue';
  import MainWrapper from '../components/MainWrapper.vue';
  import SidebarWrapper from '../components/SidebarWrapper.vue';

  export default {
    async asyncData({store, route}) {
      if (store.state.auth.authenticated) {
        await store.dispatch('loadFeedPage', {initial: true});
      }
    },

    computed: mapState({
      authenticated: (state) => state.auth.authenticated,
    }),

    components: {
      Feed,
      AppContainer,
      MainWrapper,
      SidebarWrapper,
      LoggedOutHome,
    },
  };
</script>