<template>
  <transition name="modal-open" :duration="{enter: 1500, leave: 1000}">
    <div v-if="showAddSongModal" class="modal-overlay" @click="handleOverlayClick">
      <div class="modal-content" @click="handleModalClick">
        <p>
          Hello world!
        </p>
      </div>
    </div>
  </transition>
</template>

<script>
import {mapState} from 'vuex';

export default {
  computed: mapState({
    showAddSongModal: (state) => state.addSong.showModal,
  }),
  methods: {
    handleOverlayClick() {
      this.$store.dispatch('closeAddSong');
    },
    handleModalClick(evt) {
      evt.stopPropagation();
    }
  }
}
</script>