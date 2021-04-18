<template>
  <button
    class="action-button"
    @click="handleRemoveSong"
    :disabled="requestInFlight"
  >
    <icon :glyph="deleteIcon" />
  </button>
</template>

<script>
import Icon from '../Icon.vue';

const deleteIcon = require('~/assets/close.svg');

export default {
  components: { Icon },

  props: ['songId', 'mixtapeId'],

  data() {
    return {
      deleteIcon,
      requestInFlight: false,
    };
  },

  methods: {
    async handleRemoveSong(e) {
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
};
</script>
