<template>
  <div v-if="authenticated" :class="['sidebar', { '-open': open }]">
    <p>
      what up,
      <router-link :to="`/users/${currentUserName}`">
        {{ currentUserName }}
      </router-link>
    </p>

    <add-song-button />

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
        <router-link to="/find-friends">
          find twitter friends
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
import AddSongButton from './AddSongButton.vue';

export default {
  components: { AddSongButton },

  props: ['open'],

  computed: {
    currentUserName() {
      return this.$store.state.currentUser.name;
    },
    authenticated() {
      return this.$store.state.auth.authenticated;
    },
  },

  methods: {
    async handleSignOut(evt) {
      evt.preventDefault();

      await this.$axios({
        baseURL: null,
        url: '/auth/sign-out',
        method: 'POST',
      });

      document.location.href = '/';
    },
  },
};
</script>

<style lang="scss" scoped>
@import '../../styles/mixins';

.sidebar {
  padding: 10px 20px;
  background: lighten($black, 5%);
  position: relative;
  font-family: 'Open Sans', sans-serif;
  color: white;

  @media (max-width: $breakpoint-small) {
    position: fixed;
    width: 300px;
    height: 100%;
    top: $header-height;
    left: -300px;
    z-index: 2;

    transition: 0.2s left ease-in;

    &.-open {
      left: 0;
    }
  }

  a,
  a:visited {
    color: #ccc;
  }

  ul {
    list-style-type: none;
    padding-left: 0;

    li a {
      display: block;
      width: 100%;
      text-decoration: none;
      padding: 8px 0;

      &.router-link-exact-active {
        color: white;
        font-weight: 600;
      }
      &:hover {
        color: white;
      }
    }
  }
}
</style>
