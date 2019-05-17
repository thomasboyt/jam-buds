<template>
  <transition name="modal-open" :duration="{ enter: 1500, leave: 1000 }">
    <div
      v-if="showAddSongModal"
      class="modal-overlay"
      @click="handleOverlayClick"
    >
      <div class="modal-content" @click="handleModalClick">
        <add-song-flow />
      </div>
    </div>
  </transition>
</template>

<script>
import { mapState } from 'vuex';

import AddSongFlow from './AddSongFlow.vue';

export default {
  components: { AddSongFlow },

  computed: mapState({
    showAddSongModal: (state) => state.addSong.showModal,
  }),
};
</script>
