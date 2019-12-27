<template>
  <modal :title="title" :is-open="isOpen" @close="handleCloseModal">
    <transition name="fade">
      <div class="fade-screen" v-if="state === INITIAL_STATE" key="initial">
        <initial-screen @selectedSong="handleSelectedSong" />
      </div>

      <div class="fade-screen" v-if="state === CONFIRM_STATE" key="confirm">
        <mixtape-confirm-screen
          v-if="mixtapeId"
          :selected-song="selectedSong"
          :mixtape-id="mixtapeId"
          @finished="handleCloseModal"
        />
        <confirm-screen
          v-else
          :selected-song="selectedSong"
          @finished="handleCloseModal"
        />
      </div>
    </transition>
  </modal>
</template>

<script>
import Modal from './Modal.vue';
import InitialScreen from './InitialScreen.vue';
import ConfirmScreen from './ConfirmScreen.vue';
import MixtapeConfirmScreen from './MixtapeConfirmScreen.vue';

const INITIAL_STATE = 'initial';
const CONFIRM_STATE = 'confirm';

export default {
  components: { Modal, InitialScreen, ConfirmScreen, MixtapeConfirmScreen },

  props: ['isOpen', 'mixtapeId', 'title'],

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

<style lang="scss" scoped>
.fade-screen {
  position: absolute;
  width: 100%;
}

.fade-enter-active {
  transition: opacity 0.25s ease 0.25s;
}

.fade-leave-active {
  transition: opacity 0.25s ease;
  opacity: 0;
}

.fade-enter {
  opacity: 0;
}
</style>
