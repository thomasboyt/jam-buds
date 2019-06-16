<template>
  <button
    type="button"
    class="publish-button"
    @click="handleClick"
    :disabled="requestInFlight"
  >
    Publish
  </button>
</template>

<script>
export default {
  props: ['mixtapeId'],

  data() {
    return {
      requestInFlight: false,
    };
  },

  methods: {
    async handleClick(e) {
      e.preventDefault();

      this.requestInFlight = true;

      try {
        await this.$store.dispatch('publishMixtape', {
          mixtapeId: this.mixtapeId,
        });
      } catch (err) {
        this.$store.commit('showErrorModal');
        throw err;
      } finally {
        this.requestInFlight = false;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.publish-button {
  color: var(--theme-text-color);
  border: 2px var(--theme-text-color) solid;

  &:hover {
    background: rgba(0, 0, 0, 0.1);
  }

  padding: 10px 15px;
  width: 130px;

  font-weight: bold;
  font-size: 16px;
}
</style>
