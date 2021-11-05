<template>
  <button
    class="action-button"
    @click="handleRemoveSong"
    :disabled="requestInFlight"
  >
    <icon :glyph="deleteIcon" />
  </button>
</template>

<script lang="ts">
import Vue from 'vue';
import Icon from '../Icon.vue';

import deleteIcon from '~/assets/close.svg';

export default Vue.extend({
  components: { Icon },

  props: {
    songId: {
      type: Number,
      required: true,
    },
    mixtapeId: {
      type: Number,
      required: true,
    },
  },

  data() {
    return {
      deleteIcon,
      requestInFlight: false,
    };
  },

  methods: {
    async handleRemoveSong(e: Event) {
      e.preventDefault();

      const confirmed = window.confirm(
        'Are you sure you want to delete this song?'
      );

      if (!confirmed) {
        return;
      }

      this.requestInFlight = true;

      try {
        await this.$accessor.mixtapes.removeSongFromMixtape({
          mixtapeId: this.mixtapeId,
          songId: this.songId,
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
