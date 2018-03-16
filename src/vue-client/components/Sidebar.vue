<template>
  <div v-if="authenticated" :class="['sidebar', {'-open': open}]">
    <p>
      what up,
      <router-link :to="`/users/${currentUserName}`">
        {{currentUserName}}
      </router-link>
    </p>

    <!-- <add-song-button></add-song-button> -->

    <ul>
      <li>
        <router-link to="/">
          your feed
        </router-link>
      </li>
      <li>
        <router-link :to="`/users/${currentUserName}`">
          your playlist
        </router-link>
      </li>
      <li>
        <router-link :to="`/users/${currentUserName}/liked`">
          your liked tracks
        </router-link>
      </li>
      <li>
        <router-link to="find-friends">
          find twitter friends on jam buds!
        </router-link>
      </li>
      <li>
        <router-link to="/settings">
          your settings
        </router-link>
      </li>
      <li>
        <router-link to="/about">
          about jam buds
        </router-link>
      </li>
    </ul>

    <p>or <a href="#" @click="handleSignOut">sign out</a></p>
  </div>
</template>

<script>
export default {
  props: ['open'],

  computed: {
    currentUserName() { return this.$store.state.currentUser.name; },
    authenticated() { return this.$store.state.auth.authenticated; }
  },

  methods: {
    async handleSignOut() {
      // TODO
      // await ajax request that clears cookies & deletes auth, then:
      // document.location.href = '/';
    }
  }
}
</script>
