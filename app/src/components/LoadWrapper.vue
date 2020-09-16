<template>
  <div>
    <slot v-if="!isLoading" />
  </div>
</template>

<script>
export default {
  props: ['error', 'isLoading'],
};
</script>

<style scoped lang="scss">
</style>