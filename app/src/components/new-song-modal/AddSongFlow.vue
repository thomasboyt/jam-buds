<template>
  <div class="add-song-screen">
    <div :style="{ textAlign: 'center' }">
      <h2>
        share a jam!
      </h2>
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
        @finished="finished"
      />
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import InitialScreen from './InitialScreen.vue';
import ConfirmScreen from './ConfirmScreen.vue';
import isMobile from '../../util/isMobile';

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
    finished() {
      this.reset();
      if (isMobile()) {
        this.$router.push('/');
      }
    },
    reset() {
      this.state = INITIAL_STATE;
      this.selectedSong = null;
    },
  },
};
</script>
