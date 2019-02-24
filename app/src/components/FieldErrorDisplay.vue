<template>
  <div class="error-display" v-if="fieldErrors">
    {{ fieldErrors[0].text }}
  </div>
</template>

<script>
export default {
  props: ['errors', 'name'],

  computed: {
    fieldErrors() {
      return (
        this.errors &&
        this.errors.filter((errors) => errors.fieldName === this.name)
      );
    },
  },
};
</script>

<style scoped>
.error-display {
  font-weight: 600;
}
</style>
