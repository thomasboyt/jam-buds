<template>
  <modal :title="title" :is-open="isOpen" @close="handleCloseModal">
    <transition name="fade">
      <div
        class="new-jam-modal fade-screen"
        v-if="state === INITIAL_STATE"
        key="initial"
      >
        <initial-screen
          :is-mixtape-search="!!mixtapeId"
          @selectItem="handleSelectedItem"
        />
      </div>

      <div
        class="new-jam-modal fade-screen"
        v-if="state === CONFIRM_STATE"
        key="confirm"
      >
        <mixtape-confirm-screen
          v-if="mixtapeId"
          selected-type="song"
          :selected-item="selectedItem"
          :mixtape-id="mixtapeId"
          @finished="handleCloseModal"
        />
        <confirm-screen
          v-else
          :selected-item="selectedItem"
          :selected-type="selectedType"
          @finished="handleCloseModal"
        />
      </div>
    </transition>
  </modal>
</template>

<script>
import Modal from '../Modal.vue';
import InitialScreen from './InitialScreen.vue';
import ConfirmScreen from './ConfirmScreen.vue';
import MixtapeConfirmScreen from './MixtapeConfirmScreen.vue';
import { closeModal } from '~/util/modal';

const INITIAL_STATE = 'initial';
const CONFIRM_STATE = 'confirm';

export default {
  components: { Modal, InitialScreen, ConfirmScreen, MixtapeConfirmScreen },

  props: ['mixtapeId', 'title'],

  data() {
    return {
      state: INITIAL_STATE,
      INITIAL_STATE,
      CONFIRM_STATE,
      selectedItem: null,
      selectedType: null,
    };
  },

  computed: {
    isOpen() {
      return this.$route.query.modal === 'new-jam';
    },
  },

  watch: {
    isOpen(isOpen) {
      if (!isOpen) {
        this.state = INITIAL_STATE;
        this.selectedSong = null;
      }
    },
  },

  methods: {
    handleSelectedItem({ type, item }) {
      this.selectedItem = item;
      this.selectedType = type;
      this.state = CONFIRM_STATE;
    },

    handleCloseModal() {
      closeModal(this.$router, this.$route);
    },
  },
};
</script>

<style lang="scss" scoped>
.fade-screen {
  position: absolute;
  width: 100%;
  height: 100%;
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
