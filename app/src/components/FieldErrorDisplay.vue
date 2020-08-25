<template>
  <div class="error-display" v-if="fieldError">
    {{ fieldError }}
  </div>
</template>

<script>
export default {
  props: ['errors', 'name'],

  computed: {
    fieldError() {
      return this.errors && this.errors[this.name];
    },
  },
};
</script>

<style scoped>
.error-display {
  font-weight: 600;
}
</style>
