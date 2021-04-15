<template>
  <main-wrapper :with-color-scheme-override="true" :fetch-state="$fetchState">
    <nuxt-child />
  </main-wrapper>
</template>

<script>
import MainWrapper from '../../components/MainWrapper.vue';

export default {
  components: { MainWrapper },

  async fetch() {
    const name = this.$route.params.id;

    if (!this.$store.state.profile.profiles[name]) {
      await this.$store.dispatch('profile/loadProfileForUser', name);
    }

    this.$store.dispatch('colorScheme/setOverrideFromProfile', name);
  },
};
</script>
