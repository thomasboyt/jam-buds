<template>
  <modal title="add to mixtape" :is-open="isOpen" @close="handleCloseModal">
    <initial-screen
      v-if="state === INITIAL_STATE"
      @selectedSong="handleSelectedSong"
    />
    <mixtape-confirm-screen
      v-if="state === CONFIRM_STATE"
      :selected-song="selectedSong"
      :mixtape-id="mixtapeId"
      @finished="handleCloseModal"
    />
  </modal>
</template>

<script>
import Modal from './Modal.vue';
import InitialScreen from './InitialScreen.vue';
import MixtapeConfirmScreen from './MixtapeConfirmScreen.vue';

const INITIAL_STATE = 'initial';
const CONFIRM_STATE = 'confirm';

export default {
  components: { Modal, InitialScreen, MixtapeConfirmScreen },

  props: ['isOpen', 'mixtapeId'],

  data() {
    return {
      state: INITIAL_STATE,
      INITIAL_STATE,
      CONFIRM_STATE,
      selectedSong: null,
    };
  },

  methods: {
    handleSelectedSong(song) {
      this.selectedSong = song;
      this.state = CONFIRM_STATE;
    },

    handleCloseModal() {
      this.$emit('close');
      this.state = INITIAL_STATE;
      this.selectedSong = null;
    },
  },
};
</script>
