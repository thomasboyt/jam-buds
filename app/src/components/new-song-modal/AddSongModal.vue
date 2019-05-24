<template>
  <transition name="modal-open" :duration="transitionDurations">
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
    transitionDurations() {
      // keep in sync with add-song.scss
      return this.$mq === 'phone'
        ? { enter: 400, leave: 250 }
        : { enter: 1500, leave: 1000 };
    },
  },

  methods: {
    handleOverlayClick() {
      this.$store.dispatch('closeAddSong');
    },
  },
};
</script>
