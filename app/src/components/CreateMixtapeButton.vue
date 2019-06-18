<template>
  <button @click="handleCreateMixtape" :disabled="requestInFlight">
    create mixtape
  </button>
</template>

<script>
export default {
  data() {
    return {
      requestInFlight: false,
    };
  },

  methods: {
    async handleCreateMixtape() {
      this.requestInFlight = true;

      let resp;
      try {
        resp = await this.$axios({
          url: '/mixtapes',
          method: 'POST',
          data: { title: 'New Mixtape' },
        });
      } catch (err) {
        this.$store.commit('showErrorModal');
        throw err;
      } finally {
        this.requestInFlight = false;
      }

      const mixtapeId = resp.data.mixtapeId;
      this.$router.push(`/mixtapes/${mixtapeId}`);
    },
  },
};
</script>

<style scoped lang="scss">
@import '../../styles/mixins.scss';

button {
  text-decoration: underline;
  margin-right: 15px;

  &:hover,
  &:active {
    text-decoration: none;
  }

  @media (max-width: $breakpoint-small) {
    display: none;
  }
}
</style>
