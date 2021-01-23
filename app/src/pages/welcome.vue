<template>
  <div class="welcome-page-wrapper" :style="{ background: gradient }">
    <logged-out-header :show-mobile="true" />

    <h1>
      <span v-if="name">welcome, {{ name }}!</span>
      <span v-else>welcome!</span>
    </h1>

    <transition name="fade">
      <nuxt-child class="fade-page" />
    </transition>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import getGradient from '../util/gradients';
import LoggedOutHeader from '../components/LoggedOutHeader.vue';

export default {
  components: { LoggedOutHeader },

  head() {
    return {
      title: 'Welcome',
    };
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
@import '~/assets/styles/mixins.scss';

h1 {
  @include page-header();
  text-align: center;
  margin-bottom: 32px;
}

.welcome-page-wrapper {
  --theme-text-color: black;
  background-attachment: fixed;

  flex: 1;

  padding-top: 40px;
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
