<template>
  <main-wrapper :with-color-scheme-override="true" :color-scheme="colorScheme">
    <nuxt-child />
  </main-wrapper>
</template>

<script>
import { mapState } from 'vuex';
import MainWrapper from '../../components/MainWrapper.vue';
import with404Handler from '~/util/with404Handler';

const isCurrentUser = (store, route) =>
  store.state.currentUser?.name === route.params.id;

export default {
  components: { MainWrapper },

  asyncData({ store, route, error }) {
    if (isCurrentUser(store, route)) {
      // if we're going to the current user's page, we don't need to load color
      // scheme. by avoiding this extra load we prevent a visual bug when
      // navigating to current user profile on mobile nav bar.
      //
      // this all goes away once color schemes are present before navigation
      // happens.
      return;
    }

    return with404Handler(
      error,
      store.dispatch('loadProfileForUser', route.params.id)
    );
  },

  computed: {
    ...mapState({
      colorScheme(state) {
        if (isCurrentUser(this.$store, this.$route)) {
          return state.currentUser.colorScheme;
        } else {
          return state.profile.user.colorScheme;
        }
      },
    }),
  },
};
</script>
