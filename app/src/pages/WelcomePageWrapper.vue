<template>
  <div class="welcome-page-wrapper">
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
import titleMixin from '../util/titleMixin';

export default {
  mixins: [titleMixin],

  title: 'Welcome',

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
  background: linear-gradient(45deg, #ef32d9, #89fffd);
  flex: 1;

  @media (min-width: $breakpoint-small) {
    padding-top: 75px;
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
