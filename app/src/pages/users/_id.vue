<template>
  <main-wrapper :with-color-scheme-override="true" :color-scheme="colorScheme">
    <nuxt-child />
  </main-wrapper>
</template>

<script>
import { mapState } from 'vuex';
import MainWrapper from '../../components/MainWrapper.vue';
import with404Handler from '~/util/with404Handler';

export default {
  components: { MainWrapper },

  asyncData({ store, route, error }) {
    if (store.state.profiles[route.params.id]) {
      // if we've already loaded this profile, skip this
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
        return state.profiles[this.$route.params.id]?.colorScheme;
      },
    }),
  },
};
</script>
