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

    if (!this.$accessor.profile.profiles[name]) {
      await this.$accessor.profile.loadProfileForUser(name);
    }

    this.$accessor.colorScheme.setOverrideFromProfile(name);
  },
};
</script>
