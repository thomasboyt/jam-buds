<template>
  <div>
    <p>Hi! This is the homepage.</p>

    <div v-if="authenticated">
      <feed></feed>
    </div>

    <p v-else>
      <a href="/auth/twitter-sign-in">
        Click me to authenticate
      </a>
    </p>
  </div>
</template>

<script>
  import {mapState} from 'vuex';
  import Feed from '../components/Feed.vue';

  export default {
    async asyncData({store, route}) {
      if (store.state.authenticated) {
        // fetch initial feed data here
        await store.dispatch('fetchFeed');
      }
    },

    computed: mapState(['authenticated', 'authToken']),

    components: {Feed},
  };
</script>