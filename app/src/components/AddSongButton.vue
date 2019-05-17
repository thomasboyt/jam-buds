<template>
  <button class="add-song" @click="handleClick" data-test="add-song">
    + Post a song!
  </button>
</template>

<script>
import isMobile from '../util/isMobile';

export default {
  methods: {
    handleClick() {
      if (isMobile()) {
        this.$router.push('/add-song');
      } else {
        this.$store.dispatch('showAddSong');
      }

      this.$emit('click');
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
