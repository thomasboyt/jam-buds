<template>
  <transition name="modal-open" :duration="{ enter: 400, leave: 400 }">
    <div
      v-if="showAddSongModal"
      class="modal-overlay"
      @click="handleOverlayClick"
    >
      <add-song-modal-content />
    </div>
  </transition>
</template>

<script>
import { mapState } from 'vuex';

import AddSongModalContent from './AddSongModalContent.vue';

export default {
  components: { AddSongModalContent },

  computed: {
    ...mapState({
      showAddSongModal: (state) => state.addSong.showModal,
    }),
  },

  methods: {
    handleOverlayClick() {
      this.$store.dispatch('closeAddSong');
    },
  },
};
</script>
