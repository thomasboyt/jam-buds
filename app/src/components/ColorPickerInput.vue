<template>
  <span ref="el">
    <input :value="value" />
  </span>
</template>

<script>
import Picker from 'vanilla-picker';

export default {
  props: ['value'],

  mounted() {
    this.picker = new Picker({
      color: this.value,
      popup: 'top',
      parent: this.$refs.el,
      alpha: false,
      onChange: (color) => {
        this.$emit('input', color.hex.slice(0, -2));
      },
    });
  },
};
</script>
