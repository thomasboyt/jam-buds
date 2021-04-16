<template>
  <main-wrapper v-if="authenticated">
    <logged-in-home />
  </main-wrapper>

  <logged-out-home v-else />
</template>

<script>
import LoggedInHome from '../components/LoggedInHome.vue';
import LoggedOutHome from '../components/LoggedOutHome.vue';
import MainWrapper from '../components/MainWrapper.vue';

export default {
  components: {
    MainWrapper,
    LoggedInHome,
    LoggedOutHome,
  },

  head() {
    return {
      meta: [
        { name: 'twitter:card', content: 'summary' },
        { hid: 'title', name: 'og:title', content: 'jam buds!' },
        {
          hid: 'description',
          name: 'og:description',
          content: 'a place for sharing music with your friends!',
        },
        {
          name: 'og:image',
          content: `${this.$config.STATIC_URL}/corgi_icon_square.png`,
        },
      ],
    };
  },

  computed: {
    authenticated() {
      return this.$accessor.auth.authenticated;
    },
  },
};
</script>
