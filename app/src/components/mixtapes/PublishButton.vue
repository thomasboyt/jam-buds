<template>
  <button type="button" class="publish-button" @click="handleClick">
    Publish
  </button>
</template>

<script>
export default {
  handleClick() {
    this.$emit('click');
  },
};
</script>

<style lang="scss" scoped>
.publish-button {
  color: var(--theme-text-color);
  border: 2px var(--theme-text-color) solid;

  &:hover {
    background: rgba(0, 0, 0, 0.1);
  }

  padding: 10px 15px;
  width: 130px;

  font-weight: bold;
  font-size: 16px;
}
</style>
