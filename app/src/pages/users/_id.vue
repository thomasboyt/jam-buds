<template>
  <main-wrapper :with-color-scheme-override="true">
    <nuxt-child />
  </main-wrapper>
</template>

<script>
import MainWrapper from '../../components/MainWrapper.vue';

export default {
  components: { MainWrapper },

  async fetch() {
    const name = this.$route.params.id;

    if (!this.$store.state.profiles[name]) {
      await this.$store.dispatch('loadProfileForUser', name);
    }

    this.$store.dispatch('colorScheme/setOverrideFromProfile', name);
  },
};
</script>
