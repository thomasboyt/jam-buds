<template>
  <div v-if="authenticated" :class="['sidebar', { '-open': open }]">
    <p>
      what up,
      <router-link
        :to="`/users/${currentUserName}`"
        @click.native="handleClick"
      >
        {{ currentUserName }}
      </router-link>
    </p>

    <add-song-button @click.native="handleClick" />

    <ul>
      <li>
        <router-link to="/" @click.native="handleClick">
          your feed
        </router-link>
      </li>
      <li>
        <router-link
          :to="`/users/${currentUserName}`"
          @click.native="handleClick"
        >
          your playlist
        </router-link>
      </li>
      <li>
        <router-link
          :to="`/users/${currentUserName}/liked`"
          @click.native="handleClick"
        >
          your liked tracks
        </router-link>
      </li>
      <li>
        <router-link to="/find-friends" @click.native="handleClick">
          find twitter friends
        </router-link>
      </li>
      <li>
        <router-link to="/settings" @click.native="handleClick">
          your settings
        </router-link>
      </li>
      <li>
        <router-link to="/about" @click.native="handleClick">
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
    handleClick() {
      this.$store.commit('closeSidebar');
    },

    async handleSignOut(evt) {
      evt.preventDefault();

      try {
        await this.$axios({
          baseURL: null,
          url: '/auth/sign-out',
          method: 'POST',
        });
      } catch (err) {
        this.$store.commit('showErrorModal');
        throw err;
      }

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
  font-family: 'Open Sans', sans-serif;
  color: white;

  position: fixed;
  height: calc(100vh - #{$header-height});
  width: $sidebar-width;

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
