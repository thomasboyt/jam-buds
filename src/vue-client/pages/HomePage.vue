<template>
  <div>
    <p>Hi! This is the homepage.</p>

    <p v-if="$store.authenticated">Authenticated. Token: {{$store.authToken}}</p>

    <p v-else>
      <a href="/auth/twitter-sign-in">
        Click me to authenticate
      </a>
    </p>
  </div>
</template>

<script>
  export default {
    // asyncData() {
    // },
  }
</script>