<template>
  <div :class="['mobile-header', { 'show-border': scrolled }]">
    <div class="header-content">
      <sidebar-toggle v-if="authenticated && isRootPage" />
      <mobile-back-button v-else-if="authenticated || !isRootPage" />

      <transition name="title-fade" mode="out-in">
        <div v-if="pageTitle" class="page-title-container" key="title">
          <h2>{{ pageTitle }}</h2>
        </div>

        <div v-else-if="!authenticated" class="logo-container" key="logo">
          <logo :small="true" />
        </div>
      </transition>

      <div class="right-container" v-if="authenticated">
        <notifications-button />
        <!-- <nuxt-link :to="{query: {modal: 'settings'}}" append>
          <icon :glyph="settingsIcon" />
        </nuxt-link>-->
      </div>
    </div>
  </div>
</template>

<script>
import SidebarToggle from './SidebarToggle.vue';
import MobileBackButton from './MobileBackButton.vue';
import NotificationsButton from '../notifications/NotificationsButton.vue';
import Logo from '../Logo.vue';
import isRootPage from '~/util/isRootPage';
// const settingsIcon = require('~/assets/settings.svg');

export default {
  components: { SidebarToggle, MobileBackButton, Logo, NotificationsButton },

  data() {
    return {
      scrolled: false,
      // settingsIcon,
    };
  },

  computed: {
    pageTitle() {
      return this.$store.state.mobileHeaderTitle;
    },
    authenticated() {
      return this.$store.state.auth.authenticated;
    },
    isRootPage() {
      return isRootPage(this.$store, this.$route);
    },
  },

  mounted() {
    document.addEventListener('scroll', this.handleScroll);
  },

  unmounted() {
    document.removeEventListener('scroll', this.handleScroll);
  },

  methods: {
    handleScroll() {
      if (window.scrollY > 0) {
        this.scrolled = true;
      } else {
        this.scrolled = false;
      }
    },
  },
};
</script>

<style lang="scss">
@import '~/assets/styles/mixins.scss';
@import '~/assets/styles/z-index.scss';

.mobile-header {
  @media (min-width: $breakpoint-small) {
    display: none;
  }

  position: fixed;
  z-index: $z-header;
  top: 0;
  width: 100%;
  height: $header-height;
  background: var(--theme-body-background);
  background-size: auto 100vh;
  border-bottom: 1px transparent solid;

  &.show-border {
    transition: box-shadow ease-out 0.1s;
    box-shadow: 0px 2px 2px rgba(0, 0, 0, 0.2);
  }

  a,
  a:visited {
    color: yellow;
  }

  button {
    padding: 0;
  }

  .icon {
    margin: 0 5px;
  }

  .header-content {
    display: grid;
    align-items: center;
    justify-items: center;
    grid-template-columns: 1fr 2fr 1fr;

    margin: 0 auto;
    height: $header-height;
  }

  .back-button .icon {
    color: $black;
  }

  .sidebar-toggle {
    margin-right: auto;

    .icon {
      fill: $black;
      width: 30px;
      height: 30px;
    }
  }

  .logo-container {
    margin-top: -5px;
    // ensure it's in the center column even if sidebar toggle isn't present (logged out)
    grid-column-start: 2;
  }

  .page-title-container {
    grid-column-start: 2;

    h2 {
      font-size: 22px;
      font-weight: 700;
      margin-bottom: 0;
      padding: 5px 0px;
      color: $black;

      &.colorful {
        // TODO: Use current page's gradient for this, or at least current user's
        background: linear-gradient(to top right, #ed72df, #89fffd);
        -webkit-background-clip: text;
        background-clip: text;
        color: rgba(255, 255, 255, 0.2);
      }
    }
  }

  .right-container {
    grid-column-start: 3;
    display: flex;
    margin-left: auto;

    a {
      display: block;
      flex: 0 0 auto;
      color: $black;
    }

    .icon {
      fill: $black;
      width: 30px;
      height: 30px;
    }
  }

  .title-fade-enter-active,
  .title-fade-leave-active {
    transition: opacity 0.1s ease-out;
  }
  .title-fade-enter,
  .title-fade-leave-to {
    opacity: 0;
  }
}
</style>
