<template>
  <div class="mobile-header">
    <div class="header-content">
      <sidebar-toggle v-if="isRootPage" />
      <mobile-back-button v-else />

      <transition name="title-fade" mode="out-in">
        <div v-if="pageTitle" class="page-title-container" key="title">
          <h2>{{ pageTitle }}</h2>
        </div>

        <div v-else class="logo-container" key="logo">
          <logo :small="true" />
        </div>
      </transition>
    </div>
  </div>
</template>

<script>
import SidebarToggle from './SidebarToggle.vue';
import Logo from '~/components/Logo.vue';
import MobileBackButton from './MobileBackButton.vue';

export default {
  components: { SidebarToggle, Logo, MobileBackButton },

  computed: {
    pageTitle() {
      return this.$store.state.mobileHeaderTitle;
    },
    isRootPage() {
      // TODO: use redux state
      return this.$route.path === this.$store.state.activeBottomTab;
    },
  },
};
</script>

<style lang="scss">
@import '~/assets/styles/mixins.scss';
@import '~/assets/styles/z-index.scss';

.mobile-header {
  position: fixed;
  z-index: $z-header;

  top: 0;
  width: 100%;
  height: $header-height;

  background: $black;

  padding: 0 20px;

  @media (min-width: $breakpoint-small) {
    display: none;
  }

  a,
  a:visited {
    color: yellow;
  }

  .header-content {
    display: grid;
    align-items: center;
    justify-items: center;
    grid-template-columns: 1fr 2fr 1fr;

    margin: 0 auto;
    height: $header-height;

    .sidebar-toggle {
      margin-right: auto;

      color: white;

      display: none;

      .icon {
        fill: white;
        width: 30px;
        height: 30px;
      }

      @media (max-width: $breakpoint-small) {
        display: block;
      }
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
      color: #ddd;
      font-size: 22px;
      font-weight: 700;
      margin-bottom: 0;

      // TODO: Use current page's gradient for this, or at least current user's
      background: linear-gradient(to top right, #ed72df, #89fffd);
      -webkit-background-clip: text;
      background-clip: text;
      color: rgba(255, 255, 255, 0.2);
      padding: 5px 0px;
    }
  }

  .title-fade-enter-active,
  .title-fade-leave-active {
    transition: opacity 0.15s ease;
  }
  .title-fade-enter,
  .title-fade-leave-to {
    opacity: 0;
  }
}
</style>
