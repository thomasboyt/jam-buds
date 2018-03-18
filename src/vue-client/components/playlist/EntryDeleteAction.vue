<template>
  <button @click="handleDelete" :disabled="requestInFlight">
    <icon :glyph="closeIcon"></icon>
  </button>
</template>

<script>
import Icon from '../Icon.vue';

const closeIcon = require('../../../../assets/close.svg');

export default {
  props: ['entry'],

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

      const confirmedDelete = window.confirm('Are you sure you want to delete this entry?')

      if (confirmedDelete) {
        this.requestInFlight = true;

        try {
          await this.$store.dispatch('deletePlaylistEntry', {id: this.entry.id});
        } catch(err) {
          console.log('request error');
          console.log(err);
        } finally {
          this.requestInFlight = false;
        }
      }
    },
  },

  components: {Icon},
}
</script>