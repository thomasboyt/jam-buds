<template>
  <modal :title="title" :is-open="isOpen" @close="handleCloseModal">
    <transition name="fade">
      <div
        class="new-jam-modal fade-screen"
        v-if="state === 'initial'"
        key="initial"
      >
        <initial-screen
          :is-mixtape-search="!!mixtapeId"
          @selectItem="handleSelectedItem"
        />
      </div>

      <div
        class="new-jam-modal fade-screen"
        v-if="state === 'confirm'"
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

<script lang="ts">
import Vue from 'vue';

import { closeModal } from '~/util/modal';
import Modal from '../Modal.vue';
import InitialScreen from './InitialScreen.vue';
import ConfirmScreen from './ConfirmScreen.vue';
import MixtapeConfirmScreen from './MixtapeConfirmScreen.vue';
import { JamType, SelectedItem } from './common';

type ModalState = 'initial' | 'confirm';

export default Vue.extend({
  components: { Modal, InitialScreen, ConfirmScreen, MixtapeConfirmScreen },

  props: {
    title: {
      type: String,
      required: true,
    },
    mixtapeId: {
      type: Number,
    },
  },

  data() {
    return {
      state: 'initial' as ModalState,
      selectedItem: null as SelectedItem | null,
      selectedType: null as JamType | null,
    };
  },

  computed: {
    isOpen(): boolean {
      return this.$route.query.modal === 'new-jam';
    },
  },

  watch: {
    isOpen(isOpen: boolean) {
      if (!isOpen) {
        this.state = 'initial';
        this.selectedItem = null;
      }
    },
  },

  methods: {
    handleSelectedItem({ type, item }: { type: JamType; item: SelectedItem }) {
      this.selectedItem = item;
      this.selectedType = type;
      this.state = 'confirm';
    },

    handleCloseModal() {
      closeModal(this.$router, this.$route);
    },
  },
});
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
