<template>
  <main-wrapper v-if="authenticated">
    <feed />
  </main-wrapper>

  <logged-out-home v-else />
</template>

<script>
import { mapState } from 'vuex';
import Feed from '../components/Feed.vue';
import LoggedOutHome from '../components/LoggedOutHome.vue';
import MainWrapper from '../components/MainWrapper.vue';

export default {
  components: {
    Feed,
    MainWrapper,
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

  computed: mapState({
    authenticated: (state) => state.auth.authenticated,
  }),
};
</script>
