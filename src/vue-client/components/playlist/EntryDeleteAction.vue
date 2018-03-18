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
    };
  },

  computed: {
    // TODO: unstub this
    requestInFlight() { return false; },
  },

  methods: {
    handleDelete(e) {
      e.preventDefault();
      e.stopPropagation();

      const confirmedDelete = window.confirm('Are you sure you want to delete this entry?')

      if (confirmedDelete) {
        // TODO
      }
    },
  },

  components: {Icon},
}
</script>