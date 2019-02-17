<template>
  <transition name="modal-open" :duration="{ enter: 1500, leave: 1000 }">
    <div
      v-if="showAddSongModal"
      class="modal-overlay"
      @click="handleOverlayClick"
    >
      <div class="modal-content" @click="handleModalClick">
        <div class="add-song-screen">
          <div :style="{ textAlign: 'center' }">
            <h2>
              share a jam!
            </h2>
          </div>

          <!-- state router -->
          <initial-screen
            v-if="state === INITIAL_STATE"
            @selectedSong="handleSelectedSong"
          />
          <confirm-screen
            v-if="state === CONFIRM_STATE"
            :selected-song="selectedSong"
            @finished="reset"
          />
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
import { mapState } from 'vuex';
import InitialScreen from './InitialScreen.vue';
import ConfirmScreen from './ConfirmScreen.vue';

const INITIAL_STATE = 'initial';
const CONFIRM_STATE = 'confirm';

export default {
  components: { InitialScreen, ConfirmScreen },

  data() {
    return {
      state: INITIAL_STATE,
      INITIAL_STATE,
      CONFIRM_STATE,
      selectedSong: null,
    };
  },

  computed: mapState({
    showAddSongModal: (state) => state.addSong.showModal,
  }),

  methods: {
    handleOverlayClick() {
      this.$store.dispatch('closeAddSong');
      this.reset();
    },
    handleModalClick(evt) {
      evt.stopPropagation();
    },
    handleSelectedSong(song) {
      this.selectedSong = song;
      this.state = CONFIRM_STATE;
    },
    reset() {
      this.state = INITIAL_STATE;
      this.selectedSong = null;
    },
  },
};
</script>
