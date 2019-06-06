<template>
  <div class="welcome-page-wrapper" :style="{ background: gradient }">
    <logged-out-header />

    <h2>
      <span v-if="name">welcome, {{ name }}!</span>
      <span v-else>welcome!</span>
    </h2>

    <transition name="fade">
      <router-view class="fade-page"></router-view>
    </transition>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import getGradient from '../util/gradients';
import LoggedOutHeader from '../components/LoggedOutHeader.vue';

export default {
  components: { LoggedOutHeader },

  metaInfo: {
    title: 'Welcome',
  },

  data() {
    return {
      gradient: getGradient('jam buds'),
    };
  },

  computed: mapState({
    name: (state) => state.auth.authenticated && state.currentUser.name,
  }),
};
</script>

<style lang="scss" scoped>
@import '../../styles/mixins.scss';

h2 {
  text-align: center;
  font-size: 48px;
  line-height: 1em;
  margin-bottom: 24px;
}

.welcome-page-wrapper {
  --theme-text-color: black;

  flex: 1;

  @media (max-width: $breakpoint-small) {
    padding-top: 100px;
  }
  @media (min-width: $breakpoint-small) {
    padding-top: 25px;
  }
}

.fade-page {
  position: absolute;
  width: 100%;
  // transition: all 0.5s cubic-bezier(0.55, 0, 0.1, 1);
}

.fade-enter-active {
  transition: opacity 0.5s ease 0.25s;
}

.fade-leave-active {
  transition: opacity 0.25s ease;
}

.fade-enter,
.fade-leave-active {
  opacity: 0;
}
</style>
