<template>
  <app-container>
    <sidebar-wrapper v-if="authenticated">
      <main-wrapper>
        <feed></feed>
      </main-wrapper>
    </sidebar-wrapper>

    <p v-else>
      <a href="/auth/twitter-sign-in">
        Click me to authenticate
      </a>
    </p>
  </app-container>
</template>

<script>
  import {mapState} from 'vuex';
  import Feed from '../components/Feed.vue';

  import AppContainer from '../components/AppContainer.vue';
  import MainWrapper from '../components/MainWrapper.vue';
  import SidebarWrapper from '../components/SidebarWrapper.vue';

  export default {
    async asyncData({store, route}) {
      if (store.state.auth.authenticated) {
        // fetch initial feed data here
        await store.dispatch('fetchFeed');
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
    },
  };
</script>