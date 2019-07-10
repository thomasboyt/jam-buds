<template>
  <Modal is-open="true" @close="handleClose">
    <p>{{ song.title }}</p>
  </Modal>
</template>

<script>
import Modal from '../components/new-song-modal/Modal.vue';

export default {
  components: { Modal },

  computed: {
    song: function() {
      // TODO: Load song if not already present!
      return this.$store.state.songs[this.$route.params.songId];
    },
  },

  methods: {
    handleClose() {
      const path = this.$route.path;
      // go up "two levels" (e.g. /users/vinny/songs/1 -> /users/vinny)
      const root = path
        .split('/')
        .slice(0, -2)
        .join('/');
      this.$router.push(root || '/');
    },
  },
};
</script>
