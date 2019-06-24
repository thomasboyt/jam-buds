<template>
  <button
    type="button"
    class="publish-button"
    @click="handleClick"
    :disabled="!hasSongs || requestInFlight"
  >
    Publish
  </button>
</template>

<script>
export default {
  props: ['mixtape'],

  data() {
    return {
      requestInFlight: false,
    };
  },

  computed: {
    hasSongs() {
      return this.mixtape.tracks.length > 0;
    },
  },

  methods: {
    async handleClick(e) {
      e.preventDefault();

      if (!window.confirm('Are you sure you want to publish this mixtape?')) {
        return;
      }

      this.requestInFlight = true;

      try {
        await this.$store.dispatch('publishMixtape', {
          mixtapeId: this.mixtape.id,
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

  &:disabled {
    cursor: default;
    opacity: 0.5;

    &:active,
    &:hover {
      transform: none;
      background: none;
    }
  }
}
</style>
