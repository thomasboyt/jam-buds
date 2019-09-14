<template>
  <div class="mobile-header">
    <div class="header-content">
      <sidebar-toggle />
      <div class="logo-container">
        <logo small />
      </div>
    </div>
  </div>
</template>

<script>
import SidebarToggle from './SidebarToggle.vue';
import Logo from './Logo.vue';

export default {
  components: { SidebarToggle, Logo },
};
</script>

<style lang="scss">
@import '../../styles/mixins.scss';
@import '../../styles/z-index.scss';

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
}
</style>