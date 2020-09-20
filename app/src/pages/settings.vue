<template>
  <main-wrapper>
    <h2>your settings</h2>

    <link-tabs link-prefix="/settings" :links="navLinks" />

    <div :style="{ marginTop: '30px' }">
      <nuxt-child />
    </div>
  </main-wrapper>
</template>

<script>
import MainWrapper from '../components/MainWrapper.vue';
import LinkTabs from '../components/LinkTabs.vue';

export default {
  components: {
    MainWrapper,
    LinkTabs,
  },

  head() {
    return {
      title: 'Settings',
    };
  },

  data() {
    return {
      navLinks: [
        { to: '', label: 'Connections' },
        { to: '/profile', label: 'Profile' },
        { to: '/notifications', label: 'Notifications' },
      ],
    };
  },
};
</script>
