<template>
  <button class="add-song" @click="handleClick" data-test="add-song">
    + Post a song!
  </button>
</template>

<script>
export default {
  methods: {
    handleClick() {
      this.$store.dispatch('showAddSong');
    },
  },
};
</script>

<style lang="scss" scoped>
button.add-song {
  display: block;
  margin: 10px auto;
  padding: 10px;

  background-color: yellow;
  color: black;
  font-weight: bold;
  font-size: 1.5em;

  &:active {
    transform: translate3d(4px, 4px, 0px);
  }
}
</style>
