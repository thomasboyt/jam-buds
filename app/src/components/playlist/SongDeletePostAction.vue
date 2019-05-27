<template>
  <button
    class="action-button"
    @click="handleDelete"
    :disabled="requestInFlight"
  >
    <icon :glyph="closeIcon" />
  </button>
</template>

<script>
import Icon from '../Icon.vue';

const closeIcon = require('../../../assets/close.svg');

export default {
  components: { Icon },

  props: ['song'],

  data() {
    return {
      closeIcon,
      requestInFlight: false,
    };
  },

  methods: {
    async handleDelete(e) {
      e.preventDefault();
      e.stopPropagation();

      const confirmedDelete = window.confirm(
        'Are you sure you want to remove your post of this song?'
      );

      if (confirmedDelete) {
        this.requestInFlight = true;

        try {
          await this.$store.dispatch('deleteSong', {
            id: this.song.id,
          });
        } catch (err) {
          console.log('request error');
          console.log(err);
        } finally {
          this.requestInFlight = false;
        }
      }
    },
  },
};
</script>
