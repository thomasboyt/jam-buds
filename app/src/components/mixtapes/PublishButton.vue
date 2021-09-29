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

<script lang="ts">
import Vue, { PropType } from 'vue'; // eslint-disable-line import/named
import { MixtapeHydrated } from '~/store/mixtapes';
import JbButton from '../lib/JbButton.vue';

export default Vue.extend({
  components: { JbButton },

  props: {
    mixtape: {
      type: Object as PropType<MixtapeHydrated>,
      required: true,
    },
  },

  data() {
    return {
      requestInFlight: false,
    };
  },

  computed: {
    hasSongs(): boolean {
      return this.mixtape.tracks ? this.mixtape.tracks.length > 0 : false;
    },
  },

  methods: {
    async handleClick(e: Event) {
      e.preventDefault();

      if (!window.confirm('Are you sure you want to publish this mixtape?')) {
        return;
      }

      this.requestInFlight = true;

      try {
        await this.$accessor.mixtapes.publishMixtape({
          mixtapeId: this.mixtape.id,
        });
      } catch (err) {
        this.$accessor.showErrorModal();
        throw err;
      } finally {
        this.requestInFlight = false;
      }
    },
  },
});
</script>

<style lang="scss" scoped>
.publish-button {
  padding: 15px 40px;
}
</style>
