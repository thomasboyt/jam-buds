<template>
  <div v-if="authenticated" :class="['sidebar', { '-open': open }]">
    <div class="logo-container">
      <logo />
    </div>

    <p>what up, {{ currentUserName }}?</p>

    <ul>
      <li>
        <nuxt-link to="/" @click.native="handleClick"> your feed </nuxt-link>
      </li>
      <li>
        <nuxt-link
          :to="`/users/${currentUserName}`"
          @click.native="handleClick"
          :class="{
            'profile-link': true,
            'profile-link-active': profileActive,
          }"
        >
          your profile
        </nuxt-link>
      </li>
      <li>
        <nuxt-link
          :to="`/users/${currentUserName}/mixtapes`"
          @click.native="handleClick"
        >
          your mixtapes
        </nuxt-link>
      </li>
      <li>
        <nuxt-link to="/find-friends" @click.native="handleClick">
          find friends
        </nuxt-link>
      </li>
      <li>
        <nuxt-link to="/public-feed" @click.native="handleClick">
          public feed
        </nuxt-link>
      </li>
      <li>
        <nuxt-link to="/settings" @click.native="handleClick">
          your settings
        </nuxt-link>
      </li>
      <li>
        <nuxt-link to="/about" @click.native="handleClick">
          about jam buds
        </nuxt-link>
      </li>
      <li>
        <a href="#" @click="handleSignOut">sign out</a>
      </li>
    </ul>
  </div>
</template>

<script>
import Logo from '~/components/Logo.vue';

export default {
  components: { Logo },

  props: ['open'],

  computed: {
    currentUserName() {
      return this.$store.state.currentUser.name;
    },
    authenticated() {
      return this.$store.state.auth.authenticated;
    },
    profileActive() {
      return (
        this.$route.path.startsWith(`/users/${this.currentUserName}`) &&
        this.$route.path !== `/users/${this.currentUserName}/mixtapes`
      );
    },
  },

  methods: {
    handleClick() {
      this.$store.commit('closeSidebar');
    },

    async handleSignOut(evt) {
      evt.preventDefault();

      const confirmed = window.confirm('Are you sure you want to sign out?');
      if (!confirmed) {
        return;
      }

      try {
        await this.$axios({
          baseURL: null,
          url: '/api/sign-out',
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
@import '~/assets/styles/mixins.scss';
@import '~/assets/styles/z-index.scss';

.sidebar {
  padding: 10px 20px;
  background: $lighter-black;
  font-family: 'Open Sans', sans-serif;
  font-size: 16px;
  color: #ccc;

  position: fixed;
  height: 100vh;
  width: $sidebar-width;

  @media (max-width: $breakpoint-small) {
    position: fixed;
    width: $mobile-sidebar-width;
    height: 100%;
    top: 0;
    left: -$mobile-sidebar-width;
    z-index: $z-sidebar;

    transition: 0.2s left ease-in;

    &.-open {
      left: 0;
    }
  }

  .logo-container {
    margin: 20px auto 40px;
    @media (min-width: $breakpoint-small) {
      text-align: center;
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

      &.nuxt-link-exact-active,
      // 1) prevent "your feed" from always being highlighted!
      // 2) special case so profile is always highlighted unless "your mixtapes" is active
      &.nuxt-link-active:not([href='/']):not(.profile-link),
      &.profile-link-active {
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
