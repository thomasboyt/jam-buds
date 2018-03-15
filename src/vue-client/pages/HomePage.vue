<template>
  <div>
    <p>Hi! This is the homepage.</p>

    <p v-if="authenticated">
      Authenticated. Token: {{authToken}}

      <button v-on:click="signOut()">
      </button>
    </p>

    <p v-else>
      <a href="/auth/twitter-sign-in">
        Click me to authenticate
      </a>
    </p>
  </div>
</template>

<script>
  import {mapState} from 'vuex';

  export default {
    asyncData({store, route}) {
      return store.dispatch('fetchCurrentUser');
    },
    computed: mapState(['authenticated', 'authToken']),
  }
</script>