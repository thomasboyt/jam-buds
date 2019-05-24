<template>
  <div class="modal-content" @click="handleModalClick">
    <div class="add-song-screen">
      <div class="modal-top-row">
        <div :style="{ textAlign: 'center' }">
          <h2>
            share a jam!
          </h2>
        </div>

        <button
          class="modal-close-button"
          type="button"
          @click="handleCloseModal"
        >
          <icon :glyph="closeIcon" />
        </button>
      </div>

      <!-- state router -->
      <div :style="{ flex: '1 0 auto' }">
        <initial-screen
          v-if="state === INITIAL_STATE"
          @selectedSong="handleSelectedSong"
        />
        <confirm-screen
          v-if="state === CONFIRM_STATE"
          :selected-song="selectedSong"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { enableBodyScroll, disableBodyScroll } from 'body-scroll-lock';

import InitialScreen from './InitialScreen.vue';
import ConfirmScreen from './ConfirmScreen.vue';
import Icon from '../Icon.vue';

const closeIcon = require('../../../assets/close.svg');

const INITIAL_STATE = 'initial';
const CONFIRM_STATE = 'confirm';

export default {
  components: { InitialScreen, ConfirmScreen, Icon },

  data() {
    return {
      state: INITIAL_STATE,
      INITIAL_STATE,
      CONFIRM_STATE,
      selectedSong: null,
      closeIcon,
    };
  },

  mounted() {
    disableBodyScroll();
  },

  beforeDestroy() {
    enableBodyScroll();
  },

  methods: {
    handleModalClick(evt) {
      evt.stopPropagation();
    },

    handleCloseModal() {
      this.$store.dispatch('closeAddSong');
    },

    handleSelectedSong(song) {
      this.selectedSong = song;
      this.state = CONFIRM_STATE;
    },
  },
};
</script>
