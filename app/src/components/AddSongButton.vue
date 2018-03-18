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
    }
  }
}
</script>