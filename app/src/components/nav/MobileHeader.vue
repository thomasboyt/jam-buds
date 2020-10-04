<template>
  <div :class="['mobile-header', { 'show-border': scrolled }]">
    <div class="header-content">
      <div class="header-left">
        <mobile-back-button v-if="!isRootPage" class="icon-link" />
      </div>

      <div class="header-center">
        <transition name="title-fade" mode="out-in">
          <div v-if="pageTitle" class="page-title-container" key="title">
            <h2>{{ pageTitle }}</h2>
          </div>

          <div v-else-if="!authenticated" class="logo-container" key="logo">
            <logo :small="true" />
          </div>
        </transition>
      </div>

      <div class="header-right">
        <template v-if="authenticated">
          <notifications-button class="icon-link" />
        </template>
      </div>
    </div>
  </div>
</template>

<script>
import MobileBackButton from './MobileBackButton.vue';
import NotificationsButton from '../notifications/NotificationsButton.vue';
import Logo from '../Logo.vue';
import isRootPage from '~/util/isRootPage';

export default {
  components: {
    MobileBackButton,
    Logo,
    NotificationsButton,
  },

  data() {
    return {
      scrolled: false,
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
  // support ios notch
  height: calc(#{$header-height} + env(safe-area-inset-top, 0px));
  padding-top: env(safe-area-inset-top, 0px);

  background: var(--theme-body-background);
  background-size: 100vw 100vh;
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
    grid-template-columns: 1fr 2fr 1fr;

    margin: 0 auto;
    height: $header-height;
    padding: 0 4px;

    .header-left {
      justify-self: left;
    }

    .header-center {
      justify-self: center;
    }

    .header-right {
      justify-self: right;
      display: flex;
      align-items: center;
    }
  }

  .icon-link {
    display: block;
    flex: 0 0 auto;
    line-height: 0;

    .icon {
      color: $black;
      fill: $black;
      width: 26px;
      height: 26px;
    }
  }

  .logo-container {
    margin-top: -5px;
  }

  .page-title-container h2 {
    font-size: 22px;
    font-weight: 700;
    margin-bottom: 0;
    color: $black;
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
