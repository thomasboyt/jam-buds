<template>
  <jb-button
    type="button"
    class="publish-button"
    @click="handleClick"
    :disabled="!hasSongs || requestInFlight"
  >
    Publish
  </jb-button>
</template>

<script>
import JbButton from '../lib/JbButton';

export default {
  components: { JbButton },

  props: ['mixtape'],

  data() {
    return {
      requestInFlight: false,
    };
  },

  computed: {
    hasSongs() {
      return this.mixtape.tracks ? this.mixtape.tracks.length > 0 : false;
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
  padding: 15px 40px;
}
</style>
